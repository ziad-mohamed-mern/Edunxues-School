import mongoose, { Document, Schema } from "mongoose";

export interface IAssignmentTask {
  title: string;
  instructions: string;
  points: number;
}

export interface IAssignment extends Document {
  title: string;
  subject: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  dueDate: Date;
  isActive: boolean;
  tasks: IAssignmentTask[];
}

const assignmentSchema = new Schema(
  {
    title: { type: String, required: true },
    subject: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    class: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    teacher: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dueDate: { type: Date, required: true },
    isActive: { type: Boolean, default: false },
    tasks: [
      {
        title: { type: String, required: true },
        instructions: { type: String, required: true },
        points: { type: Number, default: 10 },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IAssignment>("Assignment", assignmentSchema);
