const express = require("express")
const User = require("../models/users")
const Event = require("../models/events")
const catchErrors = require("../public/javascripts/async-error")
const router = express.Router()

function needAuth(req, res, next) {
  if (req.session.user) {
    next()
  } else {
    req.flash("danger", "Please signin first.")
    res.redirect("/signin")
  }
}

function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.name == "admin") {
    next()
  } else {
    req.flash("danger", "no access")
    res.redirect("back")
  }
}

function validateForm(form, options) {
  var name = form.name || ""
  var email = form.email || ""
  name = name.trim()
  email = email.trim()

  if (!name) {
    return "Name is required."
  }

  if (!email) {
    return "Email is required."
  }

  if (!form.password) {
    return "Password is required."
  }

  if (form.password.length < 6) {
    return "Password must be at least 6 characters."
  }

  return null
}


/* 
settings

관리자 전용 페이지 
*/

// 이동
router.get("/settings", isAdmin, catchErrors(async(req, res, next) => {
  const users = await User.find({})

  res.render("users/settings", { users: users })
}))




/* 
My profile

각 계정별 프로필
*/

// 이동
router.get("/:id", catchErrors(async(req, res, next) => {
  const user = await User.findById(req.params.id)
  const myEvents = await Event.find({ author: user.id })
  const favoriteEvent = await Event.find({ _id: user.favorite })

  res.render("users/show", { user: user, myEvents: myEvents, fEvents: favoriteEvent })
}))




/* 
edit

사용자 편집(My profile 내) 
*/

// 이동
router.get("/:id/edit", needAuth, catchErrors(async(req, res, next) => {
  const user = await User.findById(req.params.id)

  res.render("users/edit", { user: user })
}))

// 새로 입력한 profile로 edit
router.put("/:id", needAuth, catchErrors(async(req, res, next) => {
  const err = validateForm(req.body)
  if (err) {
    req.flash("danger", err)
    return res.redirect("back")
  }

  const user = await User.findById(req.params.id)
  if (!user) {
    req.flash("danger", "Not exist user.")
    return res.redirect("back")
  }

  if (!await user.comparePassword(req.body.current_password)) {
    req.flash("danger", "Password is incorrect")
    return res.redirect("back")
  }
  user.name = req.body.name
  user.email = req.body.email
  user.password = req.body.password
  await user.save()

  delete req.session.user
  req.flash("success", "Updated successfully. Please login again.")
  res.redirect("/")
}))




/* 
delete

사용자 삭제(My profile 내)
*/

// 해당 사용자 삭제
router.delete("/:id", needAuth, catchErrors(async(req, res, next) => {
  const user = await User.findById(req.params.id)

  user.deleteCheck = 1
  await user.save()

  delete req.session.user
  req.flash("success", "Deleted Successfully.")
  res.redirect("/")
}))




/* 
sign up

회원가입
*/

// 작성한 폼대로 새 user 저장
router.post("/", catchErrors(async(req, res, next) => {
  const err = validateForm(req.body)
  if (err) {
    req.flash("danger", err)
    return res.redirect("back")
  }

  const user = await User.findOne({ email: req.body.email })
  if (user) {
    req.flash("danger", "Email address already exists.")
    return res.redirect("back")
  }

  var newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  })
  await newUser.save()
  
  req.flash("success", "Registered successfully. Please sign in.")
  res.redirect("/")
}))


module.exports = router
