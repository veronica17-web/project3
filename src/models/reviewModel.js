const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const reviewSchema = new mongoose.Schema(
  {
    bookId: {
      type: ObjectId,
      required: true,
      ref: "book",
    },
    reviewedBy: {
      type: String,
      required: true,
      default: "Guest",
    },
    reviewedAt: {
      type: Date,
      required: true,
      default: new Date(),
    },
    rating: {
      type: Number,
      required: true,
    },
    review: String,
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("review", reviewSchema);
