const express = require("express");
const { join } = require("path");
const fse = require("fs-extra");
const uniqid = require("uniqid");
const { body, validationResult } = require("express-validator");

const router = express.Router();
const reviewsPath = join(__dirname, "reviews.json");

//GET method
router.get("/", async (req, res) => {
  let reviewsFile = await fse.readJSON(reviewsPath);
  res.send(reviewsFile);
});

//GET a specific review
router.get("/:id", async (req, res) => {
  let reviewsFile = await fse.readJSON(reviewsPath);
  const review = reviewsFile.filter((review) => review._id === req.params.id);
  res.send(review);
});

// POST method
router.post(
  "/",
  [
    body("comment").exists(),
    body("rate").isInt({ max: 5 }),
    body("elementId").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    } else {
      let newReview = { _id: uniqid(), ...req.body, createdAt: new Date() };
      let reviewsFile = await fse.readJSON(reviewsPath);
      reviewsFile.push(newReview);
     
      await fse.writeJSON(reviewsPath, reviewsFile);
      res.send("Posted Sucessfully");
    }
  }
);

//PUT method
router.put("/:id", async (req, res) => {
  let replacement = { ...req.body, _id: req.params.id, updatedAt: new Date() };
  let reviewsFile = await fse.readJSON(reviewsPath);
  const filteredReviewFile = reviewsFile.filter(
    (review) => review._id !== req.params.id
  );
  filteredReviewFile.push(replacement);
  await fse.writeJSON(reviewsPath, filteredReviewFile);
  res.send("Successfully edited");
});

//DELETE method
router.delete("/:id", async (req, res) => {
  let reviewsFile = await fse.readJSON(reviewsPath);
  const filteredReviewFile = reviewsFile.filter(
    (review) => review._id !== req.params.id
  );
  fse.writeFileSync(
    join(__dirname, "reviews.json"),
    JSON.stringify(filteredReviewFile)
  );
  res.send("Deleted Sucessfully");
});

module.exports = router;
