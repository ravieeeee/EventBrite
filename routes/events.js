const express = require("express")
const bodyParser = require("body-parser")
const User = require("../models/users")
const Event = require("../models/events")
const catchErrors = require("../public/javascripts/async-error")
const router = express.Router()


function needAuth(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.flash("danger", "Please signin first.");
    res.redirect("/signin");
  }
}

function is_valid_foam(rb) {
  const keys = Object.keys(rb)
  for (let i = 0; i < keys.length; i++) {
    if (!rb[keys[i]]) {
      if (keys[i] !== "ticketPrice" && keys[i] !== "maxParticipants") {
        return false        
      }
    }
  }
  return true
}

function set_default(req) {
  var ticketPrice, maxParticipants;

  if (req.body.ticketType === "free") {
    ticketPrice = 0
  } else {
    ticketPrice = req.body.ticketPrice
  }

  if (req.body.maxParticipantsType === "no consideration") {
    maxParticipants = 0
  } else {
    maxParticipants = req.body.maxParticipants
  }

  return {
    ticketP: ticketPrice,
    maxP: maxParticipants
  }
}


/* 
Browse events

이벤트 목록
*/

// 이동
router.get("/lists", catchErrors(async(req, res, next) => {
  const events = await Event.find({})
  res.render("events/lists", { events: events })
}))




/* 
Create event

이벤트 생성
*/

// 이동
router.get("/create", needAuth, catchErrors(async(req, res, next) => {
  res.render("events/create")
}))

// 이벤트 생성
router.post("/", needAuth, catchErrors(async(req, res, next) => {
  const rb = req.body
  if (!is_valid_foam(rb)) {
    req.flash("danger", "Fill all blanks")
    return res.redirect("back")
  }

  const ticketP = set_default(req).ticketP
  const maxP = set_default(req).maxP
 
  const u = req.session.user
  var newEvent = new Event({
    author: u._id,
    title: rb.title,
    location: rb.location,
    starts: rb.starts,
    ends: rb.ends,
    eventDescription: rb.eventDescription,
    organizerName: rb.organizerName,
    organizerDescription: rb.organizerDescription,
    eventType: rb.eventType,
    eventTopic: rb.eventTopic,
    ticketType: rb.ticketType,
    ticketPrice: ticketP,
    maxParticipantsType: rb.maxParticipantsType,
    maxParticipants: maxP
  });
  await newEvent.save()
  
  req.flash("success", "Created a event successfully.")
  res.redirect("/")
}))




/* 
event info

개별 이벤트 정보
*/

// 이동
router.get("/:id", catchErrors(async(req, res, next) => {
  const event = await Event.findById(req.params.id)
  const user = await User.findById(event.author)

  res.render("events/show", { event: event, user: user })
}))




/* 
edit event

이벤트 편집(My profile 통해)
*/

// 이동
router.get("/:id/edit", needAuth, catchErrors(async(req, res, next) => {
  const event = await Event.findById(req.params.id)
  res.render("events/edit", { event: event })
}))

// 이벤트 편집 처리
router.put("/:id", needAuth, catchErrors(async(req, res, next) => {
  const rb = req.body
  if (!is_valid_foam(rb)) {
    req.flash("danger", "Fill all blanks")
    return res.redirect("back")
  }

  const ticketP = set_default(req).ticketP
  const maxP = set_default(req).maxP
  
  const event = await Event.findById({ _id: req.params.id })
  event.title = rb.title
  event.location = rb.location
  event.starts = rb.starts
  event.ends = rb.ends
  event.eventDescription = rb.eventDescription
  event.organizerName = rb.organizerName
  event.organizerDescription = rb.organizerDescription
  event.eventType = rb.eventType
  event.eventTopic = rb.eventTopic
  event.ticketType = rb.ticketType
  event.ticketPrice = ticketP
  event.maxParticipantsType = rb.maxParticipantsType
  event.maxParticipants = maxP
  await event.save()

  req.flash("success", "Updated successfully.")
  res.redirect("/events/lists")
}))




/* 
delete event

이벤트 삭제(My profile 통해)
*/

// 삭제 처리
router.delete("/:id", needAuth, catchErrors(async(req, res, next) => {
  await Event.findOneAndRemove({ _id: req.params.id })

  req.flash("success", "Deleted Successfully.");
  res.redirect("/events/lists");
}))




/* 
participate event

이벤트 참여
*/

// 참여 처리
router.get("/:id/participate", needAuth, catchErrors(async(req, res, next) => {
  const event = await Event.findById(req.params.id)
  event.participants++

  if (
    event.maxParticipantsType == "set the value" &&
    event.maxParticipants < event.participants
  ) {
    req.flash("danger", "The event is full")
    return res.redirect("back")
  }

  event.participantsList.push(req.session.user.id)
  
  await event.save()

  req.flash("success", "Complete register.")
  res.redirect("back")
}))




/* 
favorite event

지정한 이벤트 favorite 리스트에 등록
*/

// favorite 처리
router.get("/:id/favorite", needAuth, catchErrors(async(req, res, next) => {
  const event = await Event.findById(req.params.id)
  const user = await User.findById(req.session.user.id)

  user.favorite.push(event._id)
  await user.save()

  req.flash("success", "added favorite list.")
  res.redirect("back")
}))




/* 
event admin page

이벤트 등록자의 관리 페이지
*/

// 이동
router.get("/:id/admin", catchErrors(async(req, res, next) => {
  const event = await Event.findById(req.params.id)

  res.render("events/show_admin", { event: event })
}))




/* 
participants list

참가자 리스트 확인
*/

// 이동
router.get("/:id/participantsList", catchErrors(async(req, res, next) => {
  const event = await Event.findById(req.params.id)
  const users = await User.find({ _id: event.participantsList })

  res.render("events/show_admin_pL", { users: users })
}))


module.exports = router;
