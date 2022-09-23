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

    const requiredFields = ["reviewedBy", "reviewedAt", "rating", "review"];

    for (key in data) {
      if (!requiredFields.includes(key)) {
        return res.status(400).send({
          status: false,
          message: `keys must be among ${requiredFields.join(", ")}`,
        });
      }
    }

    // const requiredKeys = ["rating", "review"];
    // for (field of requiredKeys) {
    //   for (key in data) {
    //     if (key === "reviewedBy" || key === "reviewedAt") {
    //       continue;
    //     }
    //     if (!data.hasOwnProperty(field)) {
    //       return res.status(400).send({
    //         status: false,
    //         message: `${field} is required`,
    //       });
    //     }
    //   }
    // }

    // if (!data.hasOwnProperty("rating")) {
    //   return res.status(400).send({
    //     status: false,
    //     message: "rating is required",
    //   });
    // }

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
    let bookcolection = await bookModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { reviews: reviewDocuments.length },
        { new: true }
      )
      .lean();
    bookcolection.reviewsData = [...reviewDocuments]; //are we have to send only created review or entire reviews

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
    const Ids = req.params;
    const keyIds = Object.keys(Ids);
    for (let i = 0; i < keyIds.length; i++) {
      if (Ids[keyIds[i]] === ":bookId" || Ids[keyIds[i]] === ":reviewId") {
        return res.status(400).send({
          status: false,
          message: `${keyIds[i]} is required`,
        });
      }
    }
    let reqIds = ["bookId", "reviewId"];
    for (field of reqIds) {
      if (!ObjectId.isValid(Ids[field])) {
        return res.status(400).send({
          status: false,
          message: `Given ${field} is an invalid ObjectId`,
        });
      }
    }

    let data = req.body;
    if (Object.keys(data).length == 0) {
      return res.status(400).send({
        status: false,
        message: "reqiured data to update the reviews",
      });
    }
    const requiredFields = ["reviewedBy", "rating", "review"];

    for (key in data) {
      if (!requiredFields.includes(key)) {
        return res.status(400).send({
          status: false,
          message: `keys must be among ${requiredFields.join(
            ", "
          )} to update review`,
        });
      }
    }

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

    let BookDoc = await bookModel
      .findOne({ _id: bookId, isDeleted: false })
      .lean();
    if (!BookDoc) {
      return res.status(400).send({
        status: false,
        message: "no books are founded",
      });
    }

    let UpdatedReviewDoc = await reviewModel.findOneAndUpdate(
      { _id: reviewId, isDeleted: false },
      data,
      { new: true }
    );
    if (!UpdatedReviewDoc) {
      return res.status(400).send({
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
    const Ids = req.params;
    const keyIds = Object.keys(Ids);
    for (let i = 0; i < keyIds.length; i++) {
      if (Ids[keyIds[i]] === ":bookId" || Ids[keyIds[i]] === ":reviewId") {
        return res.status(400).send({
          status: false,
          message: `${keyIds[i]} is required`,
        });
      }
    }
    let reqIds = ["bookId", "reviewId"];
    for (field of reqIds) {
      if (!ObjectId.isValid(Ids[field])) {
        return res.status(400).send({
          status: false,
          message: `Given ${field} is an invalid ObjectId`,
        });
      }
    }

    let reviewdata = await reviewModel.findOneAndUpdate(
      { _id: reviewId, isDeleted: false },
      { isDeleted: true }
    );
    if (!reviewdata) {
      return res.status(400).send({
        status: false,
        message: "no reviews are founded",
      });
    }

    let reviewDocuments = await reviewModel.find({ bookId, isDeleted: false });

    let bookDocument = await bookModel.findOneAndUpdate(
      { _id: bookId, isDeleted: false },
      { reviews: reviewDocuments.length }
    );
    if (!bookDocument) {
      return res.status(400).send({
        status: false,
        message: "no book are found",
      });
    }

    return res
      .status(200)
      .send({ status: true, message: " deleted successfully" });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { createReview, updateReview, deleteReview };
