// const userModel = require("../models/userModel");
const bookModel = require("../models/bookModel");
const reviewModel = require("../models/reviewModel");
const { isValid, checkISBN, checkDate } = require("../validation/validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

//===============================createBook========================================//

async function createBook(req, res) {
  try {
    const data = req.body;

    let errors = [];

    let requiredFields = [
      "title",
      "excerpt",
      "ISBN",
      "category",
      "subcategory",
      "releasedAt",
    ];
    for (field of requiredFields) {
      if (!data.hasOwnProperty(field)) {
        errors.push(`${field} is required in request body to create book`);
        continue;
      }

      if (!isValid(data[field])) {
        errors.push(
          `value of ${field} must be in string and should contain something`
        );
      }
      if (field === "ISBN") {
        if (!checkISBN(data.ISBN)) {
          errors.push("invalid ISBN");
        }
      }
      if (field === "releasedAt") {
        if (!checkDate(data.releasedAt)) {
          errors.push("Date format must be in YYYY-MM-DD");
        }
      }
      if (["title", "ISBN"].includes(field)) {
        const emp = {};
        emp[field] = data[field];
        const document = await bookModel.findOne(emp);
        if (document) {
          errors.push(`${field} is already exists`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).send({
        status: false,
        message: `${errors.join(", ")}`,
      });
    }

    const savedData = await bookModel.create(data);
    return res
      .status(201)
      .send({ status: true, msg: "success", data: savedData });
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
}
//===============================fetchbooks========================================//

let fetchbooks = async function (req, res) {
  try {
    let data = req.query;

    let errors = [];

    const requiredFields = ["userId", "category", "subcategory"];
    for (key in data) {
      if (!requiredFields.includes(key)) {
        errors.push(`filters must be among ${requiredFields.join(", ")}`);
      }
      if (key === "userId") {
        if (data.hasOwnProperty(key)) {
          if (!ObjectId.isValid(data.userId)) {
            errors.push("Given userId is an invalid ObjectId");
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

    data.isDeleted = false;

    let getDocs = await bookModel.find(data).select({
      _id: 1,
      title: 1,
      excerpt: 1,
      userId: 1,
      category: 1,
      releasedAt: 1,
      reviews: 1,
    });
    getDocs.sort((a, b) =>
      a.title.toLowerCase().localeCompare(b.title.toLowerCase())
    );
    if (getDocs.length == 0) {
      return res
        .status(404)
        .send({ status: false, message: "No books founded" });
    }
    return res
      .status(200)
      .send({ status: true, message: "Books list", data: getDocs });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

//===============================getBooks========================================//

const getBooks = async function (req, res) {
  try {
    let id = req.params.bookId;
    if (id === ":bookId") {
      return res
        .status(400)
        .send({ status: false, message: "bookId is required" });
    }

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        status: false,
        message: "Given bookId is an invalid ObjectId",
      });
    }

    const reviewDocuments = await reviewModel.find({ bookId: id });
    let bookcolection = await bookModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { reviews: reviewDocuments.length },
        { new: true }
      )
      .select({ __v: 0 })
      .lean();
    if (!bookcolection) {
      return res
        .status(404)
        .send({ status: false, message: "No books are founded" });
    }
    bookcolection.reviewsData = [...reviewDocuments];
    return res
      .status(200)
      .send({ status: true, msg: "Books list", data: bookcolection });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

//===============================updateBook========================================//

async function updateBook(req, res) {
  try {
    const Id = req.params.bookId;
    const data = req.body;
    if (Object.keys(data).length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "require data to update the book" });
    }

    const errors = [];

    const requiredFields = ["title", "excerpt", "releasedAt", "ISBN"];
    for (key in data) {
      if (!requiredFields.includes(key)) {
        errors.push(
          `keys must be among ${requiredFields.join(", ")} only to update book`
        );
      }
    }

    for (field of requiredFields) {
      if (data.hasOwnProperty(field)) {
        if (!isValid(data[field])) {
          errors.push(
            `value of ${field} must be in string and should contain something`
          );
          continue;
        }
        if (field === "ISBN") {
          if (!checkISBN(data.ISBN)) {
            errors.push("invalid ISBN");
          }
        }
        if (field === "releasedAt") {
          if (!checkDate(data.releasedAt)) {
            errors.push("Date format must be in YYYY-MM-DD");
          }
        }
        if (["title", "ISBN"].includes(field)) {
          const emp = {};
          emp[field] = data[field];
          const document = await bookModel.findOne(emp);
          if (document) {
            errors.push(`${field} is already exists`);
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

    const updateBook = await bookModel.findOneAndUpdate(
      { _id: Id, isDeleted: false },
      data,
      {
        new: true,
      }
    ).select({ __v: 0 });
    if (!updateBook) {
      return res
        .status(404)
        .send({ status: false, message: "No books founded" });
    }
    return res
      .status(200)
      .send({ status: true, msg: "Success", data: updateBook });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
}

//===========================deleteBook======================================//

const deleteBook = async function (req, res) {
  try {
    const Id = req.params.bookId;
    await bookModel.findOneAndUpdate(
      { _id: Id, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );
    return res
      .status(200)
      .send({ status: true, message: " deleted successfully" });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { createBook, fetchbooks, getBooks, updateBook, deleteBook };
