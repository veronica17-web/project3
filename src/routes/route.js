const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const bookController = require("../controller/bookController");
const authContoller = require("../auth/auth");
const reviewController=require("../controller/reviewController")

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
router.put(
  "/books/:bookId",
  authContoller.authentication,
  authContoller.authorization1,
  bookController.updateBook
);
router.delete(
  "/books/:bookId",
  authContoller.authentication,
  authContoller.authorization1,
  bookController.deleteBook
);
router.post("/books/:bookId/review",reviewController.createReview)
 router.put("/books/:bookId/review/:reviewId",reviewController.updateReview)
 router.delete('/books/:bookId/review/:reviewId',reviewController.deleteReview)
module.exports = router;
