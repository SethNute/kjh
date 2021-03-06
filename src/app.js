var express = require('express');
var app = express();

var path = require('path');
var http = require('http').Server(app);
var bodyParser = require('body-parser');

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.set('secret', 'supersecretencryptionkey!!!');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/CollaborativeMusicPlayer');

app.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/playlists/:genre', function(req, res, next) {
  var genre = req.params.genre;
  res.send('<h1>' + genre + ' playlist</h1>');
});

// User related routes
var userAPI = require(__dirname + '/lib/routes/userRoutes');
app.post('/user', userAPI.verifyUser, userAPI.getUser);
app.get('/users', userAPI.getUsers);
app.get('/leaderboard', userAPI.getLeaderboard);
app.post('/users', userAPI.newUser);
app.post('/users/login', userAPI.logIn);
app.put('/users', userAPI.verifyUser, userAPI.updateUser);
app.delete('/users', userAPI.verifyUser, userAPI.deleteUser);

// Starts server
http.listen(8080, function() {
  console.log('Listening on port 8080');
});