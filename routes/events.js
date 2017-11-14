var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var User = require('../models/users');
var Event = require('../models/events');

function needAuth(req, res, next) {
    if (req.session.user) {
      next();
    } else {
      req.flash('danger', 'Please signin first.');
      res.redirect('/signin');
    }
}

// 'browse event' 메인 
router.get('/lists', function(req, res, next) {
  Event.find({}, function(err, events) {
    if (err) {
      return next(err);
    }
    res.render('events/lists', {events: events});
  }); // TODO: pagination?
});

// 'create event' 메인
router.get('/create', needAuth, function(req, res, next) {
	User.find({}, function(err, users) {
		if (err) {
			return next(err);
		}
		res.render('events/create')
	});
});

// 'make event' 클릭 후
router.post('/', needAuth, (req, res, next) => {
  const user = req.session.user;
  var ticketP;
  if (req.body.ticketType == 'free') {
    ticketP = 0;
  } else {
    ticketP = req.body.ticketPrice;
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
    ticketPrice: ticketP
  });

  newEvent.save(function(err) {
    if (err) {
      return next(err);
    } else {
      req.flash('success', 'Created a event successfully.');
      res.redirect('/');
    }
  });
});

// 개별 event 페이지
router.get('/:id', (req, res, next) => {
  Event.findById(req.params.id, function(err, event) {
    if (err) {
      return next(err);
    }
    res.render('events/show', {event: event});
  });
});

// 개별 event 페이지 - edit
router.get('/:id/edit', needAuth, (req, res, next) => {
  Event.findById(req.params.id, function(err, event) {
    if (err) {
      return next(err);
    }
    res.render('events/edit', {event: event});
  });
});

// 'event update' 클릭 후
router.put('/:id', needAuth, (req, res, next) => {
  // User.findById({_id: req.params.id}, function(err, user) {
  //   user.name = req.body.name;
  //   user.email = req.body.email;
  //   if (req.body.password) {
  //     user.password = req.body.password;
  //   }

  //   user.save(function(err) {
  //     if (err) {
  //       return next(err);
  //     }
  //     req.flash('success', 'Updated successfully.');
  //     res.redirect('/users');
  //   });
  // });
});

module.exports = router;