const express = require('express');
const request = require('request');
const multer = require('multer');

const upload = multer({ dest: '/tmp/' });
const app = express();

app.post('/', upload.single('thumb'), function (req, res, next) {
  const payload = JSON.parse(req.body.payload);

  const isValidUser = (
    payload.Account.id === 1 ||
    payload.Account.title === process.env.USERNAME
  );

  const isValidPlayer = payload.Player.uuid === process.env.PLAYER;

  // If the right player is playing a track, display a notification.
  const isValidRequestType = (
    isValidPlayer &&
    isValidUser &&
    payload.Metadata.type === 'track'
  );

  const isPlayEvent = isValidRequestType &&
    (payload.event == 'media.play' || payload.event == 'media.resume');

  const isPauseEvent = isValidRequestType &&
    (payload.event == 'media.pause' || payload.event == 'media.stop');

  if (isPlayEvent || isPauseEvent) {
    const statusText = isPlayEvent ?
      `${payload.Metadata.originalTitle || payload.Metadata.grandparentTitle} - ${payload.Metadata.title}` :
      '';

    const playEmoji = req.query.playEmoji || process.env.PLAY_EMOJI || '';
    const pauseEmoji = req.query.pauseEmoji || process.env.PAUSE_EMOJI || '';
    const token = process.env.TOKEN;
    const statusEmoji = isPlayEvent ? playEmoji : pauseEmoji;

    const params = [
      ['token', token],
      ['profile', JSON.stringify({
        status_text: statusText,
        status_emoji: statusEmoji.length >= 1 ? `:${statusEmoji}:` : statusEmoji
      })]
    ];

    request.post({
      headers: {'content-type' : 'application/x-www-form-urlencoded'},
      url: 'https://slack.com/api/users.profile.set',
      body: params.
        map(([name, value]) => (
          `${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
        ).
        join('&')
    }, (error, response, body) => {
      const parsedBody = !error && response.statusCode === 200 && JSON.parse(body);
      const errorMessage = error || (!parsedBody.ok && parsedBody.error);
      const action = isPlayEvent ? 'play' : 'stop';

      if (errorMessage) {
        console.log(`error posting ${action} status: ${errorMessage}`);
      }
    });
  }

  res.sendStatus(200);
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log('listening on port ' + port);
});
