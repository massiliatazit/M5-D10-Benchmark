const express = require("express");
const { join } = require("path");
const fse = require("fs-extra");
const { check } = require("express-validator");
const uniqid = require("uniqid");
const {getmovies,writemovies} = require("../fsUtilities")
const { body, validationResult } = require("express-validator");

const router = express.Router();
const reviewsFilePath = join(__dirname, "reviews.json")
const moviesFilePath = join(__dirname, "../media/media.json")
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
    
      check("comment")
        .exists()
        .isLength({ min: 1 })
        .withMessage("Give it a comment please :) "),
      check("rate")
        .exists()
        .isLength({ min: 1 })
        .isInt({min:1,max:5})
        // .custom((val, { req }) => {
        //     console.log('here')
        //     if ( parseInt(req.body.rate) > 5) {
        //       throw new Error('The rate should be max 5');
        //     }
        // })
        .withMessage("You have to rate it at be kind give 5 :D"),
     
      check("elementId")
        .exists()
        .isLength({ min: 1 })
        .custom(async(val,{req})=>{
       
          const moviesDB = await getmovies(moviesFilePath)
            if(!moviesDB.find(movie=> movie.imdbID===req.body.elementId)) {
                throw new Error("The movie id doesn't exists ") 
        }})
        .withMessage("You need to have your movie ID"),
    
    async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        
        const err = {};
        err.message = errors;
        err.httpStatusCode = 400;
        next(err);
      } else {
        const reviewsDB = await getmovies(reviewsFilePath); 
         const moviesDB = await getmovies(moviesFilePath)
         console.log("movies data",moviesDB)
         if (moviesDB.find(movie=> movie.imdbID===req.body.elementId)) {
             const newreview = req.body;
        
        newreview.ID = uniqid(); 
       
        newreview.CreationDate = new Date(); 
        reviewsDB.push(newreview); 
         }
        await writemovies(reviewsFilePath, reviewsDB); 
        res.status(201).send(reviewsDB); 
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
