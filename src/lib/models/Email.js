import mongoose from 'mongoose'

const EmailSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  domain: {
    type: String,
    required: true
  },
  redirectUrl: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.models.Email || mongoose.model('Email', EmailSchema)