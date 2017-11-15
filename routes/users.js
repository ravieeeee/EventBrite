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

function validateForm(form, options) {
  var name = form.name || "";
  var email = form.email || "";
  name = name.trim();
  email = email.trim();

  if (!name) {
    return 'Name is required.';
  }

  if (!email) {
    return 'Email is required.';
  }

  if (!form.password) {
    return 'Password is required.';
  }

  if (form.password.length < 6) {
    return 'Password must be at least 6 characters.';
  }

  return null;
}

router.get('/settings', needAuth, function(req, res, next) {
  User.find({}, function(err, users) {
    if (err) {
      return next(err);
    }
    res.render('users/settings', {users: users});
  }); // TODO: pagination?
});

// My profile
router.get('/:id', (req, res, next) => {
  User.findById(req.params.id, function(err, user) {
    if (err) {
      return next(err);
    }
    Event.find({author: user.id}, function(err, events) {
      if (err) {
        return next(err);
      }
      res.render('users/show', {user: user, events: events});
    });
  });
});

// 관리자
router.put('/:id', needAuth, (req, res, next) => {
  var err = validateForm(req.body);
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }

  User.findById({_id: req.params.id}, function(err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('danger', 'Not exist user.');
      return res.redirect('back');
    }

    // if (user.password !== req.body.current_password) {
    //   req.flash('danger', 'Password is incorrect');
    //   return res.redirect('back');
    // }
    user.comparePassword(req.body.current_password, function(err, isMatch) {
      if (!isMatch) {
        req.flash('danger','Password is incorrect');
        return res.redirect('back');
      } else {
        user.name = req.body.name;
        user.email = req.body.email;
        if (req.body.password) {
          user.password = req.body.password;
        }

        user.save(function(err) {
        if (err) {
          return next(err);
        }
        req.flash('success', 'Updated successfully.');
        res.redirect('/users/settings');
      });

      }
    });
  });
});

router.get('/:id/edit', needAuth, (req, res, next) => {
  User.findById(req.params.id, function(err, user) {
    if (err) {
      return next(err);
    }
    res.render('users/edit', {user: user});
  });
});

router.delete('/:id', needAuth, (req, res, next) => {
  User.findOneAndRemove({_id: req.params.id}, function(err) {
    if (err) {
      return next(err);
    }
    req.flash('success', 'Deleted Successfully.');
    res.redirect('/users/settings');
  });
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/', (req, res, next) => {
  var err = validateForm(req.body, {needPassword: true});
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }
  User.findOne({email: req.body.email}, function(err, user) {
    if (err) {
      return next(err);
    }
    if (user) {
      req.flash('danger', 'Email address already exists.');
      res.redirect('back');
    }
    var newUser = new User({
      name: req.body.name,
      email: req.body.email,
    });
    newUser.password = req.body.password;

    newUser.save(function(err) {
      if (err) {
        return next(err);
      } else {
        req.flash('success', 'Registered successfully. Please sign in.');
        res.redirect('/');
      }
    });
  });
});

module.exports = router;
