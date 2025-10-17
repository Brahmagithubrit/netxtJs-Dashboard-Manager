import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  task: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    required: true,
  },
  removed: {
    type: Boolean,
    required: true,
  },
  edited: {
    type: Boolean,
    required: true,
  },
});

export default mongoose.models.task_model || mongoose.model("task_model", taskSchema);
