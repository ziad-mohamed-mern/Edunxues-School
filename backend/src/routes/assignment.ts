import express from "express";
import {
  triggerAssignmentGeneration,
  getAssignments,
  toggleAssignmentStatus,
} from "../controllers/assignment.ts";
import { protect, authorize } from "../middleware/auth.ts";

const assignmentRouter = express.Router();

assignmentRouter.post(
  "/generate",
  protect,
  authorize(["teacher", "admin"]),
  triggerAssignmentGeneration
);

assignmentRouter.get(
  "/",
  protect,
  authorize(["teacher", "student", "admin"]),
  getAssignments
);

assignmentRouter.patch(
  "/:id/status",
  protect,
  authorize(["teacher", "admin"]),
  toggleAssignmentStatus
);

export default assignmentRouter;
