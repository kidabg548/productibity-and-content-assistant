import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  name: string;
  duration: number;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  duration: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Task = mongoose.model<ITask>('Task', TaskSchema);

export default Task; 