const reviewModel = require("../models/reviewModel");
const bookModel = require("../models/bookModel");
const { isValid, checkDate, isRating } = require("../validation/validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

//=============================createReview=======================================//

async function createReview(req, res) {
  try {
    const id = req.params.bookId;
    if (id === ":bookId") {
      return res.status(400).send({
        status: false,
        message: "bookId is required",
      });
    } else {
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({
          status: false,
          message: "Given bookId is an invalid ObjectId",
        });
      }
    }
    const bookDocument = await bookModel.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!bookDocument) {
      return res.status(404).send({
        status: false,
        message: "book not founded or deleted",
      });
    }

    const data = req.body;
    if (Object.keys(data).length == 0) {
      return res.status(400).send({
        status: false,
        message: "reqiured atleast rating to create a review",
      });
    }

    const errors = [];

    const requiredFields = ["reviewedBy", "reviewedAt", "rating", "review"];

    for (key in data) {
      if (!requiredFields.includes(key)) {
        errors.push(`keys must be among ${requiredFields.join(", ")}`);
      }
    }

    for (field of requiredFields) {
      if (field === "rating") {
        if (!data.hasOwnProperty("rating")) {
          errors.push("rating is required");
          continue;
        }
        if (typeof data[field] !== "number") {
          errors.push("value of rating should be in number");
          continue;
        }
        if (!isRating(data[field])) {
          errors.push(`${field} must be in between 1-5`);
        }
        continue;
      }

      if (data.hasOwnProperty(field)) {
        if (!isValid(data[field])) {
          errors.push(
            `value of ${field} must be in string and should contain something`
          );
          continue;
        }
        if (field === "reviewedAt") {
          if (!checkDate(data[field])) {
            errors.push(
              "Date format must be in YYYY-MM-DD and should contain proper date and month"
            );
          }
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).send({
        status: false,
        message: `${errors.join(", ")}`,
      });
    }

    data.bookId = id;
    await reviewModel.create(data);
    const reviewDocuments = await reviewModel
      .find({
        bookId: id,
        isDeleted: false,
      })
      .select({ isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 });
    let bookcolection = await bookModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { reviews: reviewDocuments.length },
        { new: true }
      )
      .select({ __v: 0 })
      .lean();
    bookcolection.reviewsData = [...reviewDocuments];
    return res.status(201).send({
      status: true,
      message: "Success",
      data: bookcolection,
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
}

//=============================updateReview=======================================//

let updateReview = async function (req, res) {
  try {
    let bookId = req.params.bookId;
    let reviewId = req.params.reviewId;

    const errors = [];

    const Ids = req.params;
    const keyIds = Object.keys(Ids);
    for (let i = 0; i < keyIds.length; i++) {
      if (Ids[keyIds[i]] === ":bookId" || Ids[keyIds[i]] === ":reviewId") {
        errors.push(`${keyIds[i]} is required`);
      }
    }
    let reqIds = ["bookId", "reviewId"];
    for (field of reqIds) {
      if (Ids[field] === ":bookId" || Ids[field] === ":reviewId") {
        continue;
      }
      if (!ObjectId.isValid(Ids[field])) {
        errors.push(`Given ${field} is an invalid ObjectId`);
      }
    }

    let data = req.body;
    if (Object.keys(data).length == 0) {
      return res.status(400).send({
        status: false,
        message: `${errors.join(", ")},reqiured data to update the reviews`,
      });
    }
    const requiredFields = ["reviewedBy", "rating", "review"];

    for (key in data) {
      if (!requiredFields.includes(key)) {
        errors.push(
          `In request body keys must be among ${requiredFields.join(
            ", "
          )} to update review`
        );
      }
    }

    for (field of requiredFields) {
      if (data.hasOwnProperty(field)) {
        if (field === "rating") {
          if (typeof data[field] !== "number") {
            errors.push("value of rating should be in number");
            continue;
          }
          if (!isRating(data[field])) {
            errors.push(`${field} must be in between 1-5`);
          }
          continue;
        }
        if (!isValid(data[field])) {
          errors.push(
            `value of ${field} must be in string and should contain something`
          );
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).send({
        status: false,
        message: `${errors.join(", ")}`,
      });
    }

    let BookDoc = await bookModel
      .findOne({ _id: bookId, isDeleted: false })
      .select({ __v: 0 })
      .lean();
    if (!BookDoc) {
      return res.status(404).send({
        status: false,
        message: "no books are founded",
      });
    }

    let UpdatedReviewDoc = await reviewModel
      .findOneAndUpdate({ _id: reviewId, isDeleted: false }, data, {
        new: true,
      })
      .select({ isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 });
    if (!UpdatedReviewDoc) {
      return res.status(404).send({
        status: false,
        message: "no reviews are founded",
      });
    }

    BookDoc.reviewsData = [UpdatedReviewDoc];
    return res.status(200).send({
      status: true,
      message: "Success",
      data: BookDoc,
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//=============================deleteReview=======================================//

const deleteReview = async function (req, res) {
  try {
    let reviewId = req.params.reviewId;
    let bookId = req.params.bookId;

    const errors = [];

    const Ids = req.params;
    const keyIds = Object.keys(Ids);
    for (let i = 0; i < keyIds.length; i++) {
      if (Ids[keyIds[i]] === ":bookId" || Ids[keyIds[i]] === ":reviewId") {
        errors.push(`${keyIds[i]} is required`);
      }
    }
    let reqIds = ["bookId", "reviewId"];
    for (field of reqIds) {
      if (Ids[field] === ":bookId" || Ids[field] === ":reviewId") {
        continue;
      }
      if (!ObjectId.isValid(Ids[field])) {
        errors.push(`Given ${field} is an invalid ObjectId`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).send({
        status: false,
        message: `${errors.join(", ")}`,
      });
    }

    const bookDoc = await bookModel.findOne({
      _id: bookId,
      isDeleted: false,
    });

    if (!bookDoc) {
      return res.status(404).send({
        status: false,
        message: "book not founded or deleted",
      });
    }

    let reviewdata = await reviewModel.findOneAndUpdate(
      { _id: reviewId, isDeleted: false },
      { isDeleted: true }
    );
    if (!reviewdata) {
      return res.status(404).send({
        status: false,
        message: "no reviews are founded",
      });
    }

    let reviewDocuments = await reviewModel.find({ bookId, isDeleted: false });

    await bookModel.findOneAndUpdate(
      { _id: bookId, isDeleted: false },
      { reviews: reviewDocuments.length }
    );

    return res
      .status(200)
      .send({ status: true, message: " deleted successfully" });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { createReview, updateReview, deleteReview };
