const express = require("express");
const router = express.Router();
const wrapAsync = require("../public/util/wrapasync.js");
const { listSchema } = require("../schema.js");
const expressError = require("../public/util/expresserror.js");
const list = require("../models/listing.js");
const { isLoggedIn, isOwner } = require("../middleware/isAuthenticate.js");
const listController = require("../controllers/list.js");
const multer = require("multer");
const { storage } = require("../clodConfig.js");
const upload = multer({ storage });

const validateList = (req, res, next) => {
    let { error } = listSchema.validate(req.body);
    if (error) {
        next(new expressError(400, error.message));
    } else {
        next();
    }
};

// index & create
router
    .route("/")
    .get(wrapAsync(listController.index))
    .post(
        isLoggedIn,
        upload.single("list[image]"),
        validateList,
        wrapAsync(listController.createRoute)
    );

// new route
router.get("/new", isLoggedIn, listController.newRoute);

// show, update, delete
router
    .route("/:id")
    .get(wrapAsync(listController.showRoute))
    .put(isLoggedIn, isOwner, upload.single("list[image]"), wrapAsync(listController.updateRoute))
    .delete(isLoggedIn, isOwner, wrapAsync(listController.deleteRoute));

// edit
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listController.editRoute));

//  BOOK NOW (buy route)
router.post("/:id/buy", isLoggedIn, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await list.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/lists");
    }

    // Optional: Add booking logic here (e.g., save to a Booking model)

    req.flash("success", `You have successfully booked "${listing.title}",Details are sent to your registered email`);
    res.redirect(`/lists/${id}`);
}));

module.exports = router;