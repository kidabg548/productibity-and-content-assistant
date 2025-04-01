import mongoose, { Document } from 'mongoose';

export interface ITask extends Document {
  name: string;
  description?: string;
  duration: number;
  dueDate: Date;
  complexity: 'Easy' | 'Medium' | 'Hard';
  startTime?: Date;
  endTime?: Date;
  isBreak?: boolean;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  dueDate: {
    type: Date,
    required: true
  },
  complexity: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
    default: 'Medium'
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  isBreak: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const Task = mongoose.models.Task || mongoose.model<ITask>('Task', taskSchema);

export default Task; 