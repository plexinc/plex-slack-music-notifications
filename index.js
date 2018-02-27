var express = require('express')
  , request = require('request')
  , multer  = require('multer');

var upload = multer({ dest: '/tmp/' });
var app = express();
var isPlaying = false;

app.post('/', upload.single('thumb'), function (req, res, next) {
  var payload = JSON.parse(req.body.payload);

  var validUser   = payload.Account.id === 1 || payload.Account.title === process.env.USERNAME;
  var validPlayer = payload.Player.uuid === process.env.PLAYER;

  // If the right player is playing a track, display a notification.
  if (validPlayer && validUser && payload.Metadata.type === 'track') {
    const common = `token=${process.env.TOKEN}`;
    if (payload.event == "media.play" || payload.event == "media.resume") {
      request.post({
        headers: {'content-type' : 'application/x-www-form-urlencoded'},
        url:     'https://slack.com/api/users.profile.set',
        body:    `${common}&profile=%7B%22status_text%22%3A%22${encodeURIComponent(payload.Metadata.originalTitle || payload.Metadata.grandparentTitle)}%20-%20${encodeURIComponent(payload.Metadata.title)}%22%2C%22status_emoji%22%3A%22%3A${process.env.PLAY_EMOJI}%3A%22%7D`
      }, (error, response, body) => {
        const parsedBody = !error && response.statusCode === 200 && JSON.parse(body);
        const errorMessage = error || (!parsedBody.ok && parsedBody.error);

        if (errorMessage) {
          console.log('error posting play status: ' + errorMessage);
        }
      });
    } else if (payload.event == "media.pause" || payload.event == "media.stop") {
      request.post({
        headers: {'content-type' : 'application/x-www-form-urlencoded'},
        url:     'https://slack.com/api/users.profile.set',
        body:    `${common}&profile=%7B%22status_text%22%3A%22%22%2C%22status_emoji%22%3A%22%3A${process.env.PAUSE_EMOJI}%3A%22%7D`
      }, (error, response, body) => {
        const parsedBody = !error && response.statusCode === 200 && JSON.parse(body);
        const errorMessage = error || (!parsedBody.ok && parsedBody.error);

        if (errorMessage) {
          console.log('error posting stopped / paused status: ' + errorMessage);
        }
      });
    }
  }

  res.sendStatus(200);
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log('listening on port ' + port);
});
