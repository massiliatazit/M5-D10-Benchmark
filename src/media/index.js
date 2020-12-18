
const {getmovies,writemovies} = require("../fsUtilities")
const axios = require("axios")
const express = require ("express")
const movieRoute = express.Router();
const {writeFile} = require("fs-extra")
const {join} = require("path");
const { check } = require("express-validator");
const multer = require ('multer');

const upload = multer({})
// const PDFDocument = require("pdfkit")

const moviesPath = join(__dirname,"media.json")
const imagesPath = join (__dirname,"../../public/images")
// get movies from axios or from file with title
movieRoute.get("/",async(req,res,next)=>{
 try{
    if(req.query && req.query.title){
        let response =  axios.get(`http://www.omdbapi.com/?apikey=63174474&t=${req.query.title}`).then((response)=>res.send(response.data))
    
    }
      else{let movies = getmovies()
        
        res.send(movies)}  
        
    }catch(err){
    console.log(err),
    next(err)
}


})

// get movies with id
movieRoute.get("/:id",async(req,res,next)=>{
    let response =  axios.get(`http://www.omdbapi.com/?apikey=63174474&i=${req.params.id}`).then((response)=>res.send(response.data))
    
    


})
movieRoute.post("/:id/upload",upload.single("image"),async(req,res,next)=>{


  try{
    
      await writeFile(join(imagesPath, `${req.params.id}.${req.file.originalname.split(".").pop()}` ),
      req.file.buffer)

     res.send("image sent")
  }catch(err){
      console.log(err),
      next(err)
  }
})


movieRoute.post("/",async(req,res,next)=>{
    check("imdbID").exists().withMessage("imdbID is required").not().isEmpty()
    try{
         let newMovie = {...req.body};
    let movies = await getmovies()
    console.log(movies)
    movies.push(newMovie)
     await writemovies(movies)
    res.send("post movie")
    }catch(err){
        console.log(err),
        next(err)}
    })
    movieRoute.post("/:mediaID", async (req, res, next) => {
      try {
        const movieDB = await getmovies();
        const singleMovie = movieDB.findIndex(
          (media) => media.imdbID === req.params.mediaID
        );
        if (singleMovie !== -1) {
          movieDB[singleMovie] = req.body;
          await writemovies(movieDB);
          res.send("posted!");
        } else {
          console.log(error);
          next(error);
        }
      } catch (error) {
        console.log(error);
        next(error);
      }
    });
movieRoute.put("/:id",async(req,res,next)=>{
   let movies = await getmovies()
   let filteredmovie = movies.filter((movie)=>movie.imdbID !== req.params.id)
  

     editedmovie={...req.body,imdbID:req.params.id};
     filteredmovie.push(editedmovie)
     await writemovies(filteredmovie)
     res.send("updated movie")

   



})
mediaRouter.post("/:mediaID/reviews", async (req, res, next) => {
  try {
    const movieDB = await getmovies();
    const singleMediaIndex = movieDB.findIndex(
      (media) => media.imdbID === req.params.mediaID
    );
    if (singleMediaIndex !== -1) {
      if (movieDB[singleMediaIndex].hasOwnProperty("reviews")) {
        movieDB[singleMediaIndex].reviews.push({
          ...req.body,
          _id: uniqid(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        movieDB[singleMediaIndex].reviews = [
          {
            ...req.body,
            _id: uniqid(),
            elementId: req.params.movieDB,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
      }
      await writemovies(movieDB);
      res.send("Added!");
    } else {
      const err = new Error();
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

movieRoute.put("/:mediaID/reviews/:reviewID", async (req, res, next) => {
  try {
    const mediaDB = await getmovies();
    const singleMediaIndex = mediaDB.findIndex(
      (media) => media.imdbID === req.params.mediaID
    );
    if (singleMediaIndex !== -1) {
      let selectedReview = mediaDB[singleMediaIndex].reviews.findIndex(
        (review) => review._id === req.params.reviewID
      );
      mediaDB[singleMediaIndex].reviews[selectedReview] = {
        ...mediaDB[singleMediaIndex].reviews[selectedReview],
        ...req.body,
        updatedAt: new Date(),
      };
      await writemovies(mediaDB);
      res.send("updated!");
    } else {
      const err = new Error();
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

movieRoute.delete("/:id",async(req,res,next)=>{
  try{
    let movies = await getmovies(moviesPath)
    let filteredmovie = movies.filter((movie)=>movie.imdbID !== req.params.id)
    await writemovies(filteredmovie)

  res.send(filteredmovie)
  }catch(err){
    console.log(err),
    next(err)}

})

module.exports = movieRoute;