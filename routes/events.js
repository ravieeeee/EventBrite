var express = require("express");
var bodyParser = require("body-parser");
var router = express.Router();
var User = require("../models/users");
var Event = require("../models/events");
var momentTZ = require("moment-timezone");

function needAuth(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.flash("danger", "Please signin first.");
    res.redirect("/signin");
  }
}

// 'browse event' 메인
router.get("/lists", function(req, res, next) {
  Event.find({}, function(err, events) {
    if (err) {
      return next(err);
    }
    res.render("events/lists", { events: events });
  }); // TODO: pagination?
});

// 'create event' 메인
router.get("/create", needAuth, function(req, res, next) {
  User.find({}, function(err, users) {
    if (err) {
      return next(err);
    }
    res.render("events/create");
  });
});

// 'make event' 클릭 후
router.post("/", needAuth, (req, res, next) => {
  const user = req.session.user;
  var ticketP;
  if (req.body.ticketType == "free") {
    ticketP = 0;
  } else {
    ticketP = req.body.ticketPrice;
  }

  var maxP;
  if (req.body.maxParticipantsType == "no consideration") {
    maxP = 0;
  } else {
    maxP = req.body.maxParticipants;
  }

  var newEvent = new Event({
    author: user._id,
    title: req.body.title,
    location: req.body.location,
    starts: req.body.starts,
    ends: req.body.ends,
    eventDescription: req.body.eventDescription,
    organizerName: req.body.organizerName,
    organizerDescription: req.body.organizerDescription,
    eventType: req.body.eventType,
    eventTopic: req.body.eventTopic,
    ticketType: req.body.ticketType,
    ticketPrice: ticketP,
    maxParticipantsType: req.body.maxParticipantsType,
    maxParticipants: maxP
  });

  newEvent.save(function(err) {
    if (err) {
      return next(err);
    } else {
      req.flash("success", "Created a event successfully.");
      res.redirect("/");
    }
  });
});

// 개별 event 페이지
router.get("/:id", (req, res, next) => {
  Event.findById(req.params.id, function(err, event) {
    if (err) {
      return next(err);
    }

    User.findById(event.author, function(err, user) {
      if (err) {
        return next(err);
      }
      res.render("events/show", { event: event, user: user });
    });
  });
});

// 개별 event 페이지 - edit
router.get("/:id/edit", needAuth, (req, res, next) => {
  Event.findById(req.params.id, function(err, event) {
    if (err) {
      return next(err);
    }
    res.render("events/edit", { event: event });
  });
});

// 'event update' 클릭 후
router.put("/:id", needAuth, (req, res, next) => {
  var ticketP;
  if (req.body.ticketType == "free") {
    ticketP = 0;
  } else {
    ticketP = req.body.ticketPrice;
  }

  var maxP;
  if (req.body.maxParticipantsType == "no consideration") {
    maxP = 0;
  } else {
    maxP = req.body.maxParticipants;
  }

  Event.findById({ _id: req.params.id }, function(err, event) {
    event.title = req.body.title;
    event.location = req.body.location;
    event.starts = req.body.starts;
    event.ends = req.body.ends;
    event.eventDescription = req.body.eventDescription;
    event.organizerName = req.body.organizerName;
    event.organizerDescription = req.body.organizerDescription;
    event.eventType = req.body.eventType;
    event.eventTopic = req.body.eventTopic;
    event.ticketType = req.body.ticketType;
    (event.ticketPrice = ticketP),
      (event.maxParticipantsType = req.body.maxParticipantsType),
      (event.maxParticipants = maxP);

    event.save(function(err) {
      if (err) {
        return next(err);
      }
      req.flash("success", "Updated successfully.");
      res.redirect("/events/lists");
    });
  });
});

// event delete
router.delete("/:id", needAuth, (req, res, next) => {
  Event.findOneAndRemove({ _id: req.params.id }, function(err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Deleted Successfully.");
    res.redirect("/events/lists");
  });
});

router.get("/:id/participate", needAuth, (req, res, next) => {
  Event.findById(req.params.id, function(err, event) {
    if (err) {
      return next(err);
    }
    event.participants++;
    if (
      event.maxParticipantsType == "set the value" &&
      event.maxParticipants < event.participants
    ) {
      req.flash("danger", "The event is full");
      return res.redirect("back");
    }
    event.participantsList.push(req.session.user.id);
    event.save(function(err) {
      if (err) {
        return next(err);
      } else {
        req.flash("success", "Complete register.");
        res.redirect("back");
      }
    });
  });
});

router.get("/:id/favorite", needAuth, (req, res, next) => {
  Event.findById(req.params.id, function(err, event) {
    if (err) {
      return next(err);
    }
    User.findById(req.session.user.id, function(err, user) {
      if (err) {
        return next(err);
      }
      user.favorite.push(event._id);
      user.save(function(err) {
        if (err) {
          return next(err);
        } else {
          req.flash("success", "added favorite list.");
          res.redirect("back");
        }
      });
    });
  });
});

// 이벤트 등록자의 이벤트 관리
router.get("/:id/admin", (req, res, next) => {
  Event.findById(req.params.id, function(err, event) {
    if (err) {
      return next(err);
    }
    res.render("events/show_admin", { event: event });
  });
});

// 이벤트 등록자의 참가자 리스트 확인
router.get("/:id/participantsList", (req, res, next) => {
  Event.findById(req.params.id, function(err, event) {
    if (err) {
      return next(err);
    }
    User.find({ _id: event.participantsList }, function(err, users) {
      if (err) {
        return next(err);
      }
      res.render("events/show_admin_pL", { users: users });
    });
  });
});

module.exports = router;
