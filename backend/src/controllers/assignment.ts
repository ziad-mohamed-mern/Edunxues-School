import { type Request, type Response } from "express";
import mongoose from "mongoose";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import Assignment from "../models/assignment.ts";
import Subject from "../models/subject.ts";
import { logActivity } from "../utils/activitieslog.ts";
import { inngest } from "../inngest/index.ts";

const fallbackTasks = (topic: string) => [
  {
    title: `${topic} Concept Summary`,
    instructions: `Write a concise summary of ${topic} in your own words with 3 examples.`,
    points: 10,
  },
  {
    title: `${topic} Applied Practice`,
    instructions: `Solve 5 practice questions on ${topic} and explain each solution step.`,
    points: 15,
  },
  {
    title: `${topic} Reflection`,
    instructions:
      "List the hardest part, how you solved it, and one improvement plan for next week.",
    points: 5,
  },
];

const parseTasks = (text: string) => {
  const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBracket = cleaned.indexOf("[");
    const lastBracket = cleaned.lastIndexOf("]");
    if (firstBracket >= 0 && lastBracket > firstBracket) {
      return JSON.parse(cleaned.slice(firstBracket, lastBracket + 1));
    }
    throw new Error("AI returned invalid assignment format");
  }
};

export const triggerAssignmentGeneration = async (req: Request, res: Response) => {
  try {
    const {
      title,
      subject,
      class: classId,
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
    if (!subjectDoc) return res.status(404).json({ message: "Subject not found" });

    const teacherId = (req as any).user._id;
    const draftAssignment = await Assignment.create({
      title: title || `AI Assignment: ${topic}`,
      subject,
      class: classId,
      teacher: teacherId,
      dueDate: dueDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      isActive: false,
      tasks: [],
    });

    try {
      await inngest.send({
        name: "assignment/generate",
        data: { assignmentId: draftAssignment._id, topic, difficulty, count },
      });
    } catch {
      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (apiKey) {
        const prompt = `
Create a JSON array of ${count || 3} assignment tasks.
Context:
- Subject: ${subjectDoc.name}
- Topic: ${topic}
- Difficulty: ${difficulty || "Medium"}
Schema:
[
  {"title":"Task title","instructions":"Clear student instruction","points":10}
]
Rules: output strict JSON only.
`;
        const google = createGoogleGenerativeAI({ apiKey });
        const model = google("gemini-3-flash-preview");
        const { text } = await generateText({ model, prompt });
        const tasks = parseTasks(text);
        draftAssignment.tasks = Array.isArray(tasks) ? tasks.slice(0, 5) : fallbackTasks(topic);
      } else {
        draftAssignment.tasks = fallbackTasks(topic);
      }
      await draftAssignment.save();
    }

    await logActivity({
      userId: teacherId,
      action: `Generated assignment ${draftAssignment._id}`,
    });

    res.status(201).json({
      message: "Assignment generated successfully.",
      assignmentId: draftAssignment._id,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

export const getAssignments = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let query: any = {};
    if (user.role === "student") query = { class: user.studentClass, isActive: true };
    if (user.role === "teacher") query = { teacher: user._id };

    const assignments = await Assignment.find(query)
      .populate("subject", "name")
      .populate("class", "name section")
      .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleAssignmentStatus = async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    const user = (req as any).user;
    if (user.role !== "admin" && assignment.teacher.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to modify this assignment" });
    }

    assignment.isActive = !assignment.isActive;
    await assignment.save();
    res.json({
      message: `Assignment is now ${assignment.isActive ? "Active" : "Inactive"}`,
      _id: assignment._id,
      isActive: assignment.isActive,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
