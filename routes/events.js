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

router.get('/create', needAuth, function(req, res, next) {
	User.find({}, function(err, users) {
		if (err) {
			return next(err);
		}
		res.render('events/create')
	});
});

module.exports = router;