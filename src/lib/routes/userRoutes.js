var user = require('../schemas/userSchema');
var secret = 'supersecretencryptionkey!!!'

var api = {};
var jwt = require('jsonwebtoken');

api.verifyUser = function(req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if(token) {
    jwt.verify(token, secret, function(err, decoded) {
      if(err || !decoded) {
        // not logged in.
        res.status(400).json({});
      }
      else {
        req.user = decoded._doc;
        delete req.user.password;
        next();
      }
    });
  } else {
    // did not receive a token.
    res.status(403).json({});
  }
}

api.getUser = function(req, res, next) {
  res.json(req.user);
}

api.logIn = function(req, res, next) {
  var email = req.body.email;
  var password = req.body.password;
  if(!email || !password) {
    res.status(400).json({});
    return;
  }
  user.findOne({
    email: email
  }, function(err, user) {
    if(err || !user || user.password !== password) {
      //failed to log in
      res.status(400).json({});
    } else {
      var token = jwt.sign(user, secret,{
        expiresIn: 3600
      });
      res.status(200).json({token: token});
    }
  });
}

api.getLeaderboard = function(req, res, next) {
  user.find({})
  .select('_id username password coins')
  .sort('-coins')
  .exec(function(err, users) {
    if(err) {
      res.status(400).json({});
    } else {
      res.send(users);
    }
  });
}

api.getUsers = function(req, res, next) {
  user.find({})
  .select('_id username password coins')
  .exec(function(err, users) {
    if(err) {
      res.status(400).json({});
    } else {
      res.send(users);
    }
  });
};

api.newUser = function(req, res, next) {
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  if(!email || !password || !username) {
    res.status(400).json({});
    return;
  }
  user.findOne({$or: [{email: email}, {username:username}]}, function(err, result) {
    if(result) {
      // user already exists failed request.
      res.status(400).json({});
    } else {
      var newUser = new user({
        email: email,
        username: username,
        password: password,
        coins: 10
      });
      newUser.save(function(err) {
        if(err) {
          // couldn't save user for some reason
          res.status(400).json({});
        } else {
          delete newUser.password;
          res.status(200).json(newUser);
        }
      });
    }
  });
};

api.deleteUser = function(req, res, next) {
  var id = req.user._id;
  if(!id) {
    res.status(400).json({});
  }
  user.remove({_id:id}, function(err) {
    if(err) {
      // error removing user.
      res.status(400).json({});
    } else {
      // user removed
      res.status(200).json({});
    }
  });
};

api.updateUser = function(req, res, next) {
  var id = req.user._id;
  var newUser = req.body.user;
  if(!id || !newUser) {
    res.status(400).json({});
  }
  user.update({_id:id}, newUser, function(err, result) {
    if(err) {
      // unable to update user.
      res.status(400).json({});
    } else {
      res.status(200).json(newUser);
    }
  });
};

module.exports = api;
