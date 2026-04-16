import { type Request, type Response } from "express";
import mongoose from "mongoose";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { logActivity } from "../utils/activitieslog.ts";
import Exam from "../models/exam.ts";
import Subject from "../models/subject.ts";
import Submission from "../models/submission.ts";
import { inngest } from "../inngest/index.ts";

const parseAiExam = (text: string) => {
  const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBracket = cleaned.indexOf("[");
    const lastBracket = cleaned.lastIndexOf("]");
    if (firstBracket >= 0 && lastBracket > firstBracket) {
      return JSON.parse(cleaned.slice(firstBracket, lastBracket + 1));
    }
    throw new Error("AI returned invalid exam format");
  }
};

// @desc    Trigger AI Exam Generation
// @route   POST /api/exams/generate
export const triggerExamGeneration = async (req: Request, res: Response) => {
  try {
    const {
      title,
      subject,
      class: classId,
      duration,
      dueDate,
      topic,
      difficulty,
      count,
    } = req.body;
    if (!subject || !classId || !topic) {
      return res.status(400).json({ message: "subject, class and topic are required" });
    }
    if (
      !mongoose.Types.ObjectId.isValid(subject) ||
      !mongoose.Types.ObjectId.isValid(classId)
    ) {
      return res.status(400).json({ message: "Invalid subject or class id" });
    }
    const subjectDoc = await Subject.findById(subject);
    if (!subjectDoc)
      return res.status(404).json({ message: "Subject not found" });

    const teacherId = (req as any).user._id;
    const draftExam = await Exam.create({
      title: title || `Auto-Generated: ${topic}`,
      subject,
      class: classId,
      teacher: teacherId,
      duration: duration || 60,
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 1 week
      isActive: false, // Draft mode
      questions: [], // Empty for now, Inngest will fill this
    });

    const userId = (req as any).user._id;
    await logActivity({
      userId,
      action: `User triggered exam generation: ${draftExam._id}`,
    });

    try {
      await inngest.send({
        name: "exam/generate",
        data: {
          examId: draftExam._id,
          topic,
          subjectName: subjectDoc.name,
          difficulty: difficulty || "Medium",
          count: count || 10,
        },
      });
      return res.status(202).json({
        message: "Exam generation started.",
        examId: draftExam._id,
      });
    } catch {
      // Fallback for local/dev when Inngest event dispatch is unavailable.
      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (!apiKey) {
        return res
          .status(503)
          .json({ message: "AI service is not configured on server" });
      }

      const prompt = `
        You are a strict teacher. Create a JSON array of ${count || 10} multiple-choice questions for a high school exam.
        CONTEXT:
        - Subject: ${subjectDoc.name}
        - Topic: ${topic}
        - Difficulty: ${difficulty || "Medium"}
        RULES:
        1. Output ONLY raw JSON array.
        2. Each item: {"questionText":"...","type":"MCQ","options":["A","B","C","D"],"correctAnswer":"...","points":1}
      `;

      const google = createGoogleGenerativeAI({ apiKey });
      const activeModel = google("gemini-3-flash-preview");
      const { text } = await generateText({
        prompt,
        model: activeModel,
      });
      const aiExam = parseAiExam(text);

      if (!Array.isArray(aiExam) || aiExam.length === 0) {
        return res.status(400).json({ message: "AI returned empty exam content" });
      }

      draftExam.questions = aiExam;
      draftExam.isActive = false;
      await draftExam.save();

      return res.status(200).json({
        message: "Exam generated successfully.",
        examId: draftExam._id,
      });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// @desc    Create/Publish Exam we won't use it
// @route   POST /api/exams
export const createExam = async (req: Request, res: Response) => {
  try {
    const exam = await Exam.create({
      ...req.body,
      teacher: (req as any).user._id, // From Auth Middleware
    });
    const userId = (req as any).user._id;
    await logActivity({ userId, action: "User created a new exam" });
    res.status(201).json(exam);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Exams (Student sees available, Teacher sees created)
// @route   GET /api/exams
export const getExams = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let query = {};

    if (user.role === "student") {
      // Students see exams for their class only
      query = { class: user.studentClass, isActive: true };
    } else if (user.role === "teacher") {
      // Teachers see exams they created
      query = { teacher: user._id };
    }

    const exams = await Exam.find(query)
      .populate("subject", "name")
      .populate("class", "name section")
      .select("-questions.correctAnswer"); // Hide answers!

    res.json(exams);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get exam by id
// @route   POST /api/exams/:id
export const getExamById = async (req: Request, res: Response) => {
  try {
    const examId = req.params.id;
    const user = (req as any).user; // Assumes authMiddleware attaches user

    // 1. Initialize the query
    let query = Exam.findById(examId)
      .populate("subject", "name code")
      .populate("class", "name section")
      .populate("teacher", "name email");

    // 2. Conditional Logic: Reveal answers for Teachers/Admins
    // The '+' syntax forces selection of fields marked as { select: false } in Schema
    if (user.role === "teacher" || user.role === "admin") {
      // @ts-ignore
      query = query.select("+questions.correctAnswer");
    }

    // 3. Execute Query
    const exam = await query;

    // 4. Handle Not Found
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // 5. Security Check (Optional but recommended)
    // Ensure student belongs to the class this exam is assigned to
    if (user.role === "student") {
      // Assuming user.studentClass is a string or ObjectId
      // We compare it with the exam.class._id (which might be populated or an ID)
      const examClassId = exam.class._id
        ? exam.class._id.toString()
        : exam.class.toString();
      const userClassId = user.studentClass ? user.studentClass.toString() : "";

      if (examClassId !== userClassId) {
        return res
          .status(403)
          .json({ message: "You are not authorized to view this exam." });
      }
    }

    res.json(exam);
  } catch (error: any) {
    console.error(error);

    // Handle Invalid ID format (CastError)
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid exam ID" });
    }

    // Handle other errors
    return res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Toggle Exam Status (Active/Inactive)
// @route   PATCH /api/exams/:id/status
// @access  Private (Teacher/Admin)
export const toggleExamStatus = async (req: Request, res: Response) => {
  try {
    const examId = req.params.id;
    const user = (req as any).user;

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Security Check: Ensure the user owns the exam (if not Admin)
    if (
      user.role !== "admin" &&
      exam.teacher.toString() !== user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to modify this exam" });
    }

    // Toggle the status
    exam.isActive = !exam.isActive;
    await exam.save();
    const userId = (req as any).user._id;
    await logActivity({ userId, action: "User toggled exam status" });
    res.json({
      message: `Exam is now ${exam.isActive ? "Active" : "Inactive"}`,
      _id: exam._id,
      isActive: exam.isActive,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit & Auto-Grade Exam let these happen inside inngest
// @route   POST /api/exams/:id/submit
export const submitExam = async (req: Request, res: Response) => {
  try {
    const { answers } = req.body;
    const studentId = (req as any).user._id;
    const examParam = req.params.id;
    const examId = Array.isArray(examParam) ? examParam[0] : examParam;
    if (!examId) {
      return res.status(400).json({ message: "Invalid exam id" });
    }
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "answers are required" });
    }

    // Trigger Inngest function to handle submission
    try {
      await inngest.send({
        name: "exam/submit",
        data: {
          examId,
          studentId,
          answers,
        },
      });
    } catch {
      // Fallback for local/dev when Inngest event dispatch is unavailable.
      const existingSubmission = await Submission.findOne({
        exam: examId,
        student: studentId,
      });
      if (existingSubmission) {
        return res.status(400).json({ message: "Exam already submitted" });
      }

      const exam = await Exam.findById(examId).select("+questions.correctAnswer");
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }

      let score = 0;
      exam.questions.forEach((question) => {
        const studentAns = answers.find(
          (a: any) => a.questionId === question._id.toString()
        );
        if (studentAns && studentAns.answer === question.correctAnswer) {
          score += question.points;
        }
      });

      await Submission.create({
        exam: examId,
        student: studentId,
        answers,
        score,
      });
    }

    const userId = (req as any).user._id;
    await logActivity({ userId, action: "User submitted an exam" });

    res.status(201).json({
      message: "Exam submitted successfully.",
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: "Exam already submitted" });
    }
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Get Exam Results (For Student)
// @route   GET /api/exams/:id/result
export const getExamResult = async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user._id;
    const examId = req.params.id;

    const submission = await Submission.findOne({
      exam: examId,
      student: studentId,
    }).populate({
      path: "exam",
      select: "title questions._id questions.correctAnswer", // <--- FORCE SELECT correct answers
    });
    if (!submission) {
      return res.status(404).json({ message: "No submission found" });
    }

    res.json(submission);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
