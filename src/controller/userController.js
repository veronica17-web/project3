const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");

const {
  isValid,
  isMobileNumber,
  isValidEmail,
  isValidPincode,
  checkPassword,
  checkname,
} = require("../validation/validator");

//===============================createUser========================================//

const createUser = async function (req, res) {
  try {
    let data = req.body;

    const errors = [];

    if (Object.keys(data).length == 0) {
      return res.status(400).send({
        status: false,
        message: "require data to create user",
      });
    }

    let requiredFields = ["title", "name", "email", "phone", "password"];
    for (field of requiredFields) {
      if (!data.hasOwnProperty(field)) {
        errors.push(`${field} is required in request body to create user`);
        continue;
      }
      if (!isValid(data[field])) {
        if (field === "phone") {
          errors.push(`${field} number is invalid(must be in string)`);
          continue;
        }
        errors.push(`${field} is invalid`);
        continue;
      }
      if (field === "title") {
        let titleFeilds = ["Mr", "Mrs", "Miss"];
        if (!titleFeilds.includes(data.title)) {
          errors.push(`title must be present among ${titleFeilds.join(", ")}`);
        }
      }
      if (field === "name") {
        if (!checkname(data[field])) {
          errors.push(`${field} is invalid`);
        }
      }
      if (field === "email") {
        if (!isValidEmail(data[field])) {
          errors.push(`${field} format is invalid`);
          continue;
        }
        let checkEmail = await userModel.findOne({ email: data.email });
        if (checkEmail) {
          errors.push("email is already exist");
        }
      }
      if (field === "phone") {
        if (!isMobileNumber(data[field])) {
          errors.push("invalid phone number");
          continue;
        }
        let checkMobile = await userModel.findOne({ phone: data.phone });
        if (checkMobile) {
          errors.push("number is already exist");
        }
      }
      if (field === "password") {
        if (!checkPassword(data[field])) {
          errors.push(
            "password should contain at least (1 lowercase, uppercase ,numeric alphabetical character and at least one special character and also The string must be  between 8 characters to 16 characters)"
          );
        }
      }
    }

    if (data.hasOwnProperty("address")) {
      const addressKeys = ["street", "city", "pincode"];
      if (typeof data.address !== "object") {
        errors.push("address is invalid(must be in object)");
      } else {
        if (Object.keys(data.address).length === 0) {
          errors.push(
            `required atleast an one among these fields ${addressKeys.join(
              ", "
            )} to create address of the user`
          );
        }
      }
      for (field of addressKeys) {
        if (data.address.hasOwnProperty(field)) {
          if (!isValid(data.address[field])) {
            errors.push(
              `${field} is invalid(must be in string) and should contain something create address of the user`
            );
            continue;
          }
          if (field === "pincode") {
            if (!isValidPincode(data.address[field])) {
              errors.push(`${field} must be in six digit`);
            }
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

    let saveData = await userModel.create(data);
    return res
      .status(201)
      .send({ status: true, message: "success", data: saveData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

//===============================login========================================//

async function login(req, res) {
  try {
    const data = req.body;
    if (Object.keys(data).length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "required email and password" });
    }

    const errors = [];

    const requiredFields = ["email", "password"];
    for (field of requiredFields) {
      if (!data.hasOwnProperty(field)) {
        errors.push(`${field} is required`);
        continue;
      }
      if (!isValid(data[field])) {
        errors.push(`${field} is invalid`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).send({
        status: false,
        message: `${errors.join(", ")}`,
      });
    }

    const document = await userModel.findOne(data);
    if (!document) {
      return res
        .status(401)
        .send({ status: false, message: "email or password is incorrect" });
    }

    const token = jwt.sign(
      {
        userId: document._id,
        batch: "plutonium",
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      },
      "plutonium_project3"
    );
    return res
      .status(201)
      .send({ status: true, message: "success", token: token });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
}
module.exports = { createUser, login };
