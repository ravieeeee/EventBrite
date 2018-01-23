const express = require("express")
const User = require("../models/users")
const Event = require("../models/events")
const catchErrors = require("../public/javascripts/async-error")
const router = express.Router()


/* 
index

index 페이지 
*/

// 이동
router.get("/", catchErrors(async(req, res, next) => {
  res.render("index")
}))




/* 
signin

로그인 페이지 
*/

// 이동
router.get("/signin", catchErrors(async(req, res, next) => {
  res.render("signin")
}))

// 로그인 처리
router.post("/signin", catchErrors(async(req, res, next) => {
  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    req.flash("danger", "Invalid username")
    return res.redirect("back")
  }

  if (user.deleteCheck == 1) {
    req.flash("danger", "You are quit this!")
    return res.redirect("back")
  }

  if (await user.comparePassword(req.body.password)) {
    req.session.user = user
    req.flash("success", "Welcome!")
    return res.redirect("/")
  }

  req.flash("danger", "signin error")
  res.redirect("back")
}))




/* 
signup

회원가입 페이지 
*/

// 이동
router.get("/signup", catchErrors(async(req, res, next) => {
  res.render("signup")
}))




/* 
sign out

로그아웃 
*/

// 로그아웃 처리
router.get("/signout", catchErrors(async(req, res, next) => {
  delete req.session.user
  
  req.flash("success", "Successfully signed out.")
  res.redirect("/")
}))


module.exports = router;
