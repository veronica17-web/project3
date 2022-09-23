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
    if(Object.keys(data).length==0){
      return res.status(400).send({
        status: false,
        message: "reqiured data to create the review",
      });
    }
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
//======================================================================================//

let updateReview = async function (req, res) {
  try {
    let bookId = req.params.bookId;
    let reviewId = req.params.reviewId;
    // let reqIds = [
    //   [bookId, ":bookId"],
    //   [reviewId, ":reviewId"],
    // ];
    // for (let i = 0; i < reqIds.length; i++) {
    //   for (let j = 0; j < reqIds[i].length; j++) {
    //     if ( reqIds[i][j]=== field) {
    //       return res.status(404).send({
    //         status: false,
    //         message: `${elm} is required`,
    //       });
    //     } else {
    //       if (!ObjectId.isValid(elm)) {
    //         return res.status(404).send({
    //           status: false,
    //           message: `Given ${field} is an invalid ObjectId`,
    //         });
    //       }
    //     }
    //   }
    // }

    let data = req.body;
    if(Object.keys(data).length==0){
      return res.status(400).send({
        status: false,
        message: "reqiured data to update the reviews",
      });
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

      }
    }

    let BookDoc = await bookModel.findById({ _id: bookId, isDeleted: false }).lean();
    if (!BookDoc) {
      return res.status(400).send({
        status: false,
        message: "no books are found",
      })
    }
    let UpdatedReviewDoc = await reviewModel.findByIdAndUpdate(
      { _id: reviewId, isDeleted: false },
      data,
      { new: true }
    );
    if (!UpdatedReviewDoc) {
      return res.status(400).send({
        status: false,
        message: "no reviews are found",
      })
    }
    BookDoc.reviewsData = [UpdatedReviewDoc];
    return res.status(201).send({
      status: true,
      message: "Success",
      data: BookDoc,
    });
  } catch (err) {
    return res.status(500).send({ msg: err.message });
  }
};

module.exports = { createReview, updateReview };
