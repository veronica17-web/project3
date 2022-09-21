const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const bookController = require("../controller/bookController");
const authContoller = require("../auth/auth");

router.get("/test-me", function (req, res) {
  res.send("this is successfully created");
});

router.post("/register", userController.createUser);
router.post("/login", userController.login);
router.post(
  "/books",
  authContoller.authentication,
  authContoller.authorization,
  bookController.createBook
);
router.get("/books", authContoller.authentication, bookController.fetchbooks);
router.get(
  "/books/:bookId",
  authContoller.authentication,
  bookController.getBooks
);
module.exports = router;
