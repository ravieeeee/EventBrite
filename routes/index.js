const express = require("express");
const User = require("../models/users");
const Event = require("../models/events");
const router = express.Router();

/* GET home page. */
router.get("/", function(req, res, next) {
  Event.find({}, function(err, allEvents) {
    if (err) {
      return next(err);
    }
    res.render("index", { allEvents: allEvents, title: "Express" });
  });
});

router.get("/signin", function(req, res, next) {
  res.render("signin");
});

router.post("/signin", function(req, res, next) {
  User.findOne({ email: req.body.email }, function(err, user) {
    if (err) {
      res.render("error", { message: "Error", error: err });
    } else if (!user) {
      req.flash("danger", "Invalid username");
      res.redirect("back");
    } else
      user.comparePassword_two(req.body.password, function(err, isMatch) {
        if (err) {
          req.flash("danger", "comparePassword error");
          res.redirect("back");
        } else if (!isMatch) {
          req.flash("danger", "Invalid password");
          res.redirect("back");
        } else if (user.deleteCheck == 1) {
          req.flash("danger", "You are quit this!");
          res.redirect("back");
        } else {
          req.session.user = user;
          req.flash("success", "Welcome!");
          res.redirect("/");
        }
      });
  });
});

router.get("/signup", function(req, res, next) {
  res.render("signup");
});

router.get("/signout", function(req, res, next) {
  delete req.session.user;
  req.flash("success", "Successfully signed out.");
  res.redirect("/");
});

module.exports = router;
