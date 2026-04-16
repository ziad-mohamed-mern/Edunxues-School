import { type Request, type Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { NonRetriableError } from "inngest";
import { logActivity } from "../utils/activitieslog.ts";
import { inngest } from "../inngest/index.ts";
import Class from "../models/class.ts";
import User from "../models/user.ts";
import Timetable from "../models/timetable.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

interface GenSettings {
  startTime: string;
  endTime: string;
  periods: number;
}

const parseAiSchedule = (text: string) => {
  const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    }
    throw new Error("AI returned an invalid schedule format");
  }
};

const generateTimetableLocally = async ({
  classId,
  academicYearId,
  settings,
}: {
  classId: string;
  academicYearId: string;
  settings: GenSettings;
}) => {
  const classData = await Class.findById(classId).populate("subjects");
  if (!classData) throw new NonRetriableError("Class not found");

  const allTeacher = await User.find({ role: "teacher" });
  const classSubjectsIds = classData.subjects.map((sub: any) =>
    sub._id.toString()
  );

  const qualifiedTeachers = allTeacher
    .filter((teacher) => {
      if (!teacher.teacherSubject) return false;
      return teacher.teacherSubject.some((subId) =>
        classSubjectsIds.includes(subId.toString())
      );
    })
    .map((tea) => ({
      id: tea._id,
      name: tea.name,
      subjects: tea.teacherSubject,
    }));

  const subjectsPayload = classData.subjects.map((sub: any) => ({
    id: sub._id,
    name: sub.name,
    code: sub.code,
  }));

  if (subjectsPayload.length === 0 || qualifiedTeachers.length === 0) {
    throw new NonRetriableError("No Subjects or Teachers assigned to this class");
  }

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new NonRetriableError("GOOGLE_GENERATIVE_AI_API_KEY is missing");
  }

  const allTimetables = await Timetable.find({
    academicYear: academicYearId,
  });

  const prompt = `
    You are a school scheduler. Generate a weekly timetable (Monday to Friday).

    CONTEXT:
    - Class: ${classData.name}
    - Hours: ${settings.startTime} to ${settings.endTime} (${settings.periods} periods/day).

    RESOURCES:
    - Subjects: ${JSON.stringify(subjectsPayload)}
    - Teachers: ${JSON.stringify(qualifiedTeachers)}
    - Other Timetables: ${JSON.stringify(allTimetables)}

    STRICT RULES:
    1. Assign a Teacher to every Subject period.
    2. Teacher MUST have the subject ID in their list.
    3. Break Time/Free Period after every 2 periods(10 minutes), Lunch Time after 5 periods(at 12:00)(30 minutes).
    4. Avoid clashes with other classes(teacher can't be in two classes at the same time).
    5. Output strict JSON only. Schema:
       {
         "schedule": [
           {
             "day": "Monday",
             "periods": [
               { "subject": "SUBJECT_ID", "teacher": "TEACHER_ID", "startTime": "HH:MM", "endTime": "HH:MM" }
             ]
           }
         ]
       }
  `;

  const google = createGoogleGenerativeAI({ apiKey });
  const activeModel = google("gemini-3-flash-preview");
  const { text } = await generateText({
    prompt,
    model: activeModel,
  });

  const parsed = parseAiSchedule(text);
  if (!Array.isArray(parsed.schedule)) {
    throw new Error("AI response missing schedule array");
  }

  await Timetable.findOneAndDelete({
    class: classId,
    academicYear: academicYearId,
  });

  await Timetable.create({
    class: classId,
    academicYear: academicYearId,
    schedule: parsed.schedule,
  });
};

// @desc    Generate a Timetable using AI
// @route   POST /api/timetables/generate
// @access  Private/Admin
export const generateTimetable = async (req: Request, res: Response) => {
  try {
    const { classId, academicYearId, settings } = req.body;
    if (!classId || !academicYearId || !settings) {
      return res
        .status(400)
        .json({ message: "classId, academicYearId and settings are required" });
    }
    if (
      !mongoose.Types.ObjectId.isValid(classId) ||
      !mongoose.Types.ObjectId.isValid(academicYearId)
    ) {
      return res.status(400).json({ message: "Invalid classId or academicYearId" });
    }

    try {
      await inngest.send({
        name: "generate/timetable",
        data: {
          classId,
          academicYearId,
          settings,
        },
      });
    } catch {
      // In local/dev setups without Inngest event delivery configured, fallback inline.
      await generateTimetableLocally({ classId, academicYearId, settings });
    }
    const userId = (req as any).user._id;
    await logActivity({
      userId,
      action: `Requested timetable generation for class ID: ${classId}`,
    });
    res.status(200).json({ message: "Timetable generation started successfully" });
  } catch (error: any) {
    const message = error?.message || "Server Error";
    if (message === "Class not found") {
      return res.status(404).json({ message });
    }
    if (
      message === "No Subjects or Teachers assigned to this class" ||
      message === "AI response missing schedule array" ||
      message === "AI returned an invalid schedule format"
    ) {
      return res.status(400).json({ message });
    }
    if (message === "GOOGLE_GENERATIVE_AI_API_KEY is missing") {
      return res.status(503).json({ message: "AI service is not configured on server" });
    }
    console.error("Timetable generation failed:", error);
    res.status(500).json({ message: "Failed to generate timetable" });
  }
};

// @desc    Get Timetable by Class
// @route   GET /api/timetables/:classId
export const getTimetable = async (req: Request, res: Response) => {
  try {
    const classParam = req.params.classId;
    const classId = Array.isArray(classParam) ? classParam[0] : classParam;
    if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ message: "Invalid classId" });
    }

    const timetable = await Timetable.findOne({ class: classId })
      .populate("schedule.periods.subject", "name code")
      .populate("schedule.periods.teacher", "name email");

    if (!timetable) {
      return res.json({
        class: classId,
        schedule: [],
      });
    }

    res.json(timetable);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
