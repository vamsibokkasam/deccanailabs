import mongoose from "mongoose";

const sequenceCounterSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  value: {
    type: Number,
    default: 0,
    min: 0,
  },
});

export default mongoose.model("SequenceCounter", sequenceCounterSchema);
