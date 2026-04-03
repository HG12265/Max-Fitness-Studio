import mongoose from 'mongoose';

const trainerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String },
  phone: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const Trainer = mongoose.model('Trainer', trainerSchema);
