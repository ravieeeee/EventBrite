var express = require('express');
var router = express.Router();
var User = require('../models/users');

function needAuth(req, res, next) {
    if (req.session.user) {
      next();
    } else {
      req.flash('danger', 'Please signin first.');
      res.redirect('/signin');
    }
}

router.get('/lists', function(req, res, next) {
  res.render('events/lists');
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