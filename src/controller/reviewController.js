const reviewModel = require("../models/reviewModel");
const bookModel = require("../models/bookModel");
const { isValid, checkDate, isRating } = require("../validation/validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

async function createReview(req, res) {
  try {
    const id = req.params.bookId;
    if (id === ":bookId") {
      return res.status(404).send({
        status: false,
        message: "bookId is required",
      });
    } else {
      if (!ObjectId.isValid(id)) {
        return res.status(404).send({
          status: false,
          message: "Given bookId is an invalid ObjectId",
        });
      }
    }
    const bookDocument = await bookModel
      .findById({ _id: id, isDeleted: false })
      .lean();
    if (!bookDocument) {
      return res.status(404).send({
        status: false,
        message: "book not founded or deleted",
      });
    }

    const data = req.body;
    const requiredKeys = ["rating", "review"];
    for (field of requiredKeys) {
      for (key in data) {
        if (key === "reviewedBy" || key === "reviewedAt") {
          continue;
        }
        if (!data.hasOwnProperty(field)) {
          return res.status(400).send({
            status: false,
            message: `${field} is required`,
          });
        }
      }
    }

    const requiredFields = ["reviewedBy", "reviewedAt", "rating", "review"];
    for (field of requiredFields) {
      if (field === "rating") {
        if (typeof data[field] !== "number") {
          return res.status(400).send({
            status: false,
            message: "value of rating should be in number",
          });
        }
        if (!isRating(data[field])) {
          return res.status(400).send({
            status: false,
            message: `${field} must be in between 1-5`,
          });
        }
        continue;
      }
      if (data.hasOwnProperty(field)) {
        if (!isValid(data[field])) {
          return res.status(400).send({
            status: false,
            message: `${field} is invalid`,
          });
        }
        if (field === "reviewedAt") {
          if (!checkDate(data[field])) {
            return res.status(400).send({
              status: false,
              message: "Date format must be in YYYY-MM-DD",
            });
          }
        }
      }
    }

    data.bookId = id;
    await reviewModel.create(data);
    const reviewDocuments = await reviewModel.find({ bookId: id });
    bookDocument.reviewsData = [...reviewDocuments];
    bookDocument.reviews = reviewDocuments.length;
    return res.status(201).send({
      status: true,
      message: "Success",
      data: bookDocument,
    });
  } catch (err) {
    return res.status(500).send({ msg: err.message });
  }
}

module.exports = { createReview };
