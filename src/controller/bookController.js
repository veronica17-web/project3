const userModel = require("../models/userModel");
const bookModel = require("../models/bookModel");
const { isValid, checkISBN } = require("../validation/validator");

async function createBook(req, res) {
  try {
    const data = req.body;
    if (Object.keys(data).length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "require som data" });
    }
    let requiredKeys = [
      "title",
      "excerpt",
      "userId",
      "ISBN",
      "category",
      "subcategory",
      "releasedAt",
    ];
    for (field of requiredKeys) {
      if (!data.hasOwnProperty(field)) {
        return res
          .status(400)
          .send({ status: false, message: `${field} is required` });
      }
    }
    const requiredFields = [
      "title",
      "excerpt",
      "userId",
      "ISBN",
      "category",
      "subcategory",
      "releasedAt",
    ];
    for (field of requiredFields) {
      if (!isValid(data[field])) {
        return res
          .status(400)
          .send({ status: false, message: `${field} is invalid` });
      }
    }
    const document = await bookModel.findOne({ title: data.title });
    if (document) {
      return res
        .status(400)
        .send({ status: false, message: "title is already exists" });
    }
    const userDocument = await userModel.findOne({ _id: data.userId });
    if (!userDocument) {
      return res.status(404).send({ status: false, message: "user not found" });
    }
    if (!checkISBN(data.ISBN)) {
      return res.status(400).send({ status: false, message: "invalid ISBN" });
    }
    const bookDocument = await bookModel.findOne({ ISBN: data.ISBN });
    if (bookDocument) {
      return res
        .status(400)
        .send({ status: false, message: "ISBN is already exists" });
    }

    const savedData = await bookModel.create(data);
    return res
      .status(201)
      .send({ status: true, msg: "success", data: savedData });
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
}
//===============================================================================================
// _id, title, excerpt, userId, category, releasedAt, reviews field
 let fetchbooks = async function(req,res){
    let data = req.query
    if(Object.keys(data).length==0){return res
        .status(400)
        .send({ status: false, message: "required alteast one query" });}
        data.isDeleted=false
        let getDocs = await bookModel.find(data).select({ _id:1,title:1, excerpt:1, userId:1, category:1, releasedAt:1, reviews:1})
         if(getDocs.length==0){
            return res.status(404).send({ status: false, message: "No documents founded" });
         } 
        return res
        .status(200)
        .send({ status: true, msg: "success", data:getDocs});
 }

module.exports = { createBook ,fetchbooks};
