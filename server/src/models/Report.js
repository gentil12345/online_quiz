import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Report title is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Report type is required'],
      enum: ['progress', 'performance', 'enrollment', 'revenue'],
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    dateRange: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    summary: {
      type: String,
      default: '',
    },
    charts: [
      {
        type: { type: String },
        title: { type: String },
        data: { type: mongoose.Schema.Types.Mixed },
      },
    ],
    status: {
      type: String,
      enum: ['generating', 'completed', 'failed'],
      default: 'completed',
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model('Report', reportSchema);
export default Report;
