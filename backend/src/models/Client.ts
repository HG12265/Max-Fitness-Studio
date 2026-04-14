import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  dob: { type: String, required: true },
  age: { type: Number },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  city: { type: String },
  pincode: { type: String },
  plan: { type: String, enum: ['', 'Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'], default: '' },
  start_date: { type: String, required: true },
  end_date: { type: String },
  fee: { type: Number, required: true },
  payment_status: { type: String, enum: ['Paid', 'Pending'], required: true },
  height: { type: Number },
  weight: { type: Number },
  medical_condition: { type: String },
  emergency_contact: { type: String },
  emergency_phone: { type: String },
  trainer: { type: String },
  diet_plan: { type: String },
  workout_charts: [{
    key: { type: String, required: true },
    membership_plan: { type: String, enum: ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'], required: true },
    period: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  uid: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

export const Client = mongoose.model('Client', clientSchema);
