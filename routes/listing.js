const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing");
const {isLoggedIn, isOwner,validateListing} = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const {storage} = require("../cloudConfig.js");
const multer  = require('multer');
const upload = multer({storage });

router
.route("/")
.get( wrapAsync(listingController.index))   // index route (all listings)
.post(isLoggedIn,validateListing,upload.single('listing[image]'), wrapAsync(listingController.createListing));  //add new route Create

// search buttton route
router
.route("/search")
.get( wrapAsync(listingController.listingSearch));

//create new route
router.get("/new",isLoggedIn,listingController.renderNewForm);

router
.route("/:id")
.get( wrapAsync(listingController.showListing))     //show route (one Listing)
.put(isLoggedIn,isOwner,validateListing,upload.single('listing[image]'),wrapAsync(listingController.updateListing))   //update route
.delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing))     //DELETE route


//Edit Route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));


module.exports = router;