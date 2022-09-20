const { findOne } = require("../models/userModel");
const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");

const isValid = function (value) {
  //if(typeof value ==="undefined"|| value===null) return false;
  if (typeof value !== "string" || value.trim().length === 0) {
    return false;
  } else {
    return true;
  }
};

const isMobileNumber = function (data) {
  const mobileRegex = /^([9876]{1})([0-9]{9})$/;
  return mobileRegex.test(data);
};

const isValidEmail = function (data) {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(data);
};

function checkPassword(str) {
  var re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,16}$/;
  return re.test(str);
}

const createUser = async function (req, res) {
  try {
    let data = req.body;
    //  console.log(data)
    if (Object.keys(data).length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "require som data" });
    }
    let titleFeilds = ["Mr", "Mrs", "Miss"];

    if (!titleFeilds.includes(data.title))
      return res.status(400).send({
        status: false,
        message: `title must be present among ${titleFeilds.join(", ")}`,
      });

    const requiredFields = ["title", "name", "email", "password"];
    for (field of requiredFields) //console.log(typeof data[field])
      if (!isValid(data[field])) {
        return res
          .status(400)
          .send({ status: false, message: `${field} is required` });
      }

    const addressKeys = ["street", "city", "pincode"];
    for (field of addressKeys)
      if (!isValid(data.address[field])) {
        return res
          .status(400)
          .send({ status: false, message: `${field} is required` });
      }

    if (!isMobileNumber(data.phone)) {
      return res
        .status(400)
        .send({ status: false, message: "invalid phone number" });
    }
    let checkMobile = await userModel.findOne({ phone: data.phone });
    if (checkMobile) {
      return res
        .status(400)
        .send({ status: false, message: "number is already exist" });
    }

    if (!isValidEmail(data.email)) {
      return res
        .status(400)
        .send({ status: false, message: "invalid emailId" });
    }
    let checkEmail = await userModel.findOne({ email: data.email });
    if (checkEmail) {
      return res
        .status(400)
        .send({ status: false, message: "email is already exist" });
    }

    if (!checkPassword(data.password)) {
      return res.status(400).send({
        status: false,
        message:
          "password should contain at least 1 lowercase, uppercase ,numeric alphabetical character and at least one special character and also The string must be  between 8 characters to 16 characters",
      });
    }

    let saveData = await userModel.create(data);
    return res
      .status(201)
      .send({ status: true, msg: "success", data: saveData });
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
};

async function login(req, res) {
  try {
    const data = req.body;
    if (Object.keys(data).length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "require som data" });
    }

    const requiredFields = ["email", "password"];
    for (field of requiredFields) //console.log(typeof data[field])
      if (!isValid(data[field])) {
        return res
          .status(400)
          .send({ status: false, message: `${field} is invalid` });
      }

    if (!isValidEmail(data.email)) {
      return res
        .status(400)
        .send({ status: false, message: "invalid emailId" });
    }

    const document = await userModel.findOne(data);
    if (!document) {
      return res
        .status(400)
        .send({ status: false, message: "email or password is incorrect" });
    }
    const token = jwt.sign(
      {
        userId: document._id,
        batch: "plutonium",
      },
      "plutonium_project3"
    );
    return res.status(201).send({ status: true, msg: "success", token: token });
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
}
module.exports = { createUser, login };
