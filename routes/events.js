var express = require('express');
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
router.post('/', (req, res, next) => {
  var newEvent = new Event({
    title: req.body.title,
    location: req.body.location,
    starts: req.body.starts,
    ends: req.body.ends,
    eventDescription: req.body.eventDescription,
    organizerName: req.body.organizerName,
    organizerDescription: req.body.organizerDescription,
    eventType: req.body.eventType,
    eventTopic: req.body.eventTopic,
    ticketPrice: req.body.ticketPrice
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

module.exports = router;