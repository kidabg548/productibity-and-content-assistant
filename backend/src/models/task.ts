import mongoose, { Document } from 'mongoose';

export interface ITask extends Document {
  userId: string;
  name: string;
  description: string;
  duration: number;
  dueDate: string;
  complexity: 'Easy' | 'Medium' | 'Hard';
  startTime?: string;
  endTime?: string;
  isBreak?: boolean;
  calendarEventId?: string;
  reminderTime?: string;
  location?: string;
  attendees?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  dueDate: { type: String, required: true },
  complexity: { 
    type: String, 
    required: true,
    enum: ['Easy', 'Medium', 'Hard']
  },
  startTime: { type: String },
  endTime: { type: String },
  isBreak: { type: Boolean, default: false },
  calendarEventId: { type: String },
  reminderTime: { type: String },
  location: { type: String },
  attendees: [{ type: String }]
}, {
  timestamps: true
});

export default mongoose.models.Task || mongoose.model<ITask>('Task', taskSchema); 