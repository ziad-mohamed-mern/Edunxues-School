import { type Request, type Response } from "express";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import User from "../models/user.ts";
import Class from "../models/class.ts";
import Exam from "../models/exam.ts";
import Submission from "../models/submission.ts";
import ActivityLog from "../models/activitieslog.ts";
import Timetable from "../models/timetable.ts";

// Helper to get day name (e.g., "Monday")
const getTodayName = () =>
  new Date().toLocaleDateString("en-US", { weekday: "long" });

const getFallbackAdvice = (role: string) => {
  const bank: Record<string, string[]> = {
    admin: [
      "Review attendance trends by grade and flag classes under 90%.",
      "Schedule a teacher meeting for low-performing subjects this week.",
      "Check overdue exam publications and remind subject teachers.",
      "Track classes with unassigned teachers and resolve staffing gaps.",
      "Use recent activity logs to spot workflow bottlenecks.",
    ],
    teacher: [
      "Prioritize revision for topics where most students score below 50%.",
      "Use short quizzes after each lesson to detect weak areas early.",
      "Share a one-page weekly study checklist with your class.",
      "Follow up with students who missed two or more recent classes.",
      "Group students by mastery level for targeted practice.",
    ],
    student: [
      "Study your hardest subject first while your focus is highest.",
      "Use 25-minute focused sessions with 5-minute breaks.",
      "Revise weak topics using active recall, not just rereading.",
      "Complete pending quizzes before starting new topics.",
      "Review mistakes from your last test and write corrections.",
    ],
  };

  const pool = bank[role] ?? bank.student ?? [];
  return [...pool].sort(() => Math.random() - 0.5).slice(0, 3);
};

const fallbackMaterials = (subject: string, level: string) => ({
  sectionTitle: `${subject} Essentials for ${level}`,
  materials: [
    {
      title: `${subject} Core Concepts`,
      type: "PDF",
      description: `A concise revision note covering key ${subject} concepts.`,
      url: "#",
    },
    {
      title: `${subject} Practice Set`,
      type: "Doc",
      description: `Guided practice questions for ${level} learners.`,
      url: "#",
    },
    {
      title: `${subject} Quick Video Recap`,
      type: "Link",
      description: `Short recap lesson to reinforce fundamentals.`,
      url: "#",
    },
  ],
});

// @desc    Get Dashboard Statistics (Role Based)
// @route   GET /api/dashboard/stats
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let stats = {};
    // Get last 5 activities system-wide (Admin) or personal (Others)
    const activityQuery = user.role === "admin" ? {} : { user: user._id };
    const recentActivities = await ActivityLog.find(activityQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name");

    const formattedActivity = recentActivities.map((log) => {
      const actorName =
        log.user && typeof log.user === "object" && "name" in (log.user as any)
          ? (log.user as any).name
          : "Unknown User";
      const actionText = log.action || "performed an action";
      const timeText = new Date(log.createdAt as any).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `${actorName}: ${actionText} (${timeText})`;
    });

    if (user.role === "admin") {
      const totalStudents = await User.countDocuments({ role: "student" });
      const totalTeachers = await User.countDocuments({ role: "teacher" });
      const activeExams = await Exam.countDocuments({ isActive: true });

      // Mocking Attendance (You'd need an Attendance model for real data)
      const avgAttendance = "94.5%";

      stats = {
        totalStudents,
        totalTeachers,
        activeExams,
        avgAttendance,
        recentActivity: formattedActivity,
      };
    } else if (user.role === "teacher") {
      // 1. Count classes assigned to teacher
      const myClassesCount = await Class.countDocuments({
        classTeacher: user._id,
      });

      // 2. Pending Grading: Submissions for my exams that have no score yet
      // First find exams created by this teacher
      const myExams = await Exam.find({ teacher: user._id }).select("_id");
      const myExamIds = myExams.map((exam) => exam._id);
      const pendingGrading = await Submission.countDocuments({
        exam: { $in: myExamIds },
        score: 0, // Assuming 0 or null means ungraded
      });

      // 3. Next Class (Simplified Logic)
      // Find timetables where teacher is teaching today
      const today = getTodayName();
      // Complex aggregation could go here, but let's do a simple find for now
      // This is a placeholder for the logic to find the specific period based on current time
      const nextClass = "Mathematics - Grade 10";
      const nextClassTime = "10:00 AM";

      stats = {
        myClassesCount,
        pendingGrading,
        nextClass,
        nextClassTime,
        recentActivity: formattedActivity,
      };
    } else if (user.role === "student") {
      // 1. Assignments/Exams Due
      const nextExam = await Exam.findOne({
        class: user.studentClass,
        dueDate: { $gte: new Date() },
      }).sort({ dueDate: 1 });

      const pendingAssignments = await Exam.countDocuments({
        class: user.studentClass,
        isActive: true,
        dueDate: { $gte: new Date() },
      });

      // 2. Attendance (Mock)
      const myAttendance = "98%";

      stats = {
        myAttendance,
        pendingAssignments,
        nextExam: nextExam?.title || "No upcoming exams",
        nextExamDate: nextExam
          ? new Date(nextExam.dueDate).toLocaleDateString()
          : "",
        recentActivity: formattedActivity,
      };
    }
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// @desc    Generate AI dashboard advice
// @route   POST /api/dashboard/insight
// @access  Private
export const generateDashboardInsight = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const role = user?.role || req.body?.role || "student";

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return res.json({ advice: getFallbackAdvice(role) });
    }

    const prompt = `
You are an academic advisor. Return exactly 3 short, practical advice items for a ${role} user.
Rules:
1) Output strict JSON only.
2) Format: {"advice":["tip 1","tip 2","tip 3"]}
3) Each tip max 18 words.
4) Tips must be specific, actionable, and non-repetitive.
`;

    const google = createGoogleGenerativeAI({ apiKey });
    const model = google("gemini-3-flash-preview");
    const { text } = await generateText({ model, prompt });
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed.advice) || parsed.advice.length === 0) {
      return res.json({ advice: getFallbackAdvice(role) });
    }

    return res.json({ advice: parsed.advice.slice(0, 3) });
  } catch {
    const role = (req as any).user?.role || "student";
    return res.json({ advice: getFallbackAdvice(role) });
  }
};

// @desc    Generate AI study materials section
// @route   POST /api/dashboard/materials/generate
// @access  Private
export const generateStudyMaterials = async (req: Request, res: Response) => {
  try {
    const { subject, level, topic } = req.body as {
      subject?: string;
      level?: string;
      topic?: string;
    };

    if (!subject || !level) {
      return res.status(400).json({ message: "subject and level are required" });
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return res.json(fallbackMaterials(subject, level));
    }

    const prompt = `
You are an academic content assistant.
Generate one study section and 5 useful materials for students.

Context:
- Subject: ${subject}
- Level: ${level}
- Topic focus: ${topic || "General fundamentals"}

Return STRICT JSON only:
{
  "sectionTitle": "string",
  "materials": [
    {
      "title": "string",
      "type": "PDF|Link|Doc",
      "description": "short practical description",
      "url": "#"
    }
  ]
}

Rules:
1) Exactly 5 materials.
2) Use practical, student-friendly titles.
3) "type" must be one of PDF, Link, Doc.
4) Keep descriptions under 16 words.
`;

    const google = createGoogleGenerativeAI({ apiKey });
    const model = google("gemini-3-flash-preview");
    const { text } = await generateText({ model, prompt });
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (
      !parsed ||
      typeof parsed.sectionTitle !== "string" ||
      !Array.isArray(parsed.materials) ||
      parsed.materials.length === 0
    ) {
      return res.json(fallbackMaterials(subject, level));
    }

    const materials = parsed.materials.slice(0, 5).map((m: any) => ({
      title: m.title || "Untitled Material",
      type: ["PDF", "Link", "Doc"].includes(m.type) ? m.type : "Doc",
      description: m.description || "Helpful study reference material.",
      url: m.url || "#",
    }));

    return res.json({
      sectionTitle: parsed.sectionTitle,
      materials,
    });
  } catch {
    const { subject = "General", level = "Students" } = req.body || {};
    return res.json(fallbackMaterials(subject, level));
  }
};
