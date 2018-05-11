const express = require('express');
const multer = require('multer');
const slack = require('slack');

const upload = multer({ dest: '/tmp/' });
const app = express();

const asyncRoute = (handler) => {
  return (req, res, next, ...params) => {
    return handler.call(this, req, res, next, ...params).catch(next);
  }
};

app.post('/', upload.single('thumb'), asyncRoute(async (req, res) => {
  const payload = JSON.parse(req.body.payload);

  const token = req.query.token || process.env.TOKEN;
  const username = req.query.username || process.env.USERNAME;
  const isValidUser = (
    token && (
      payload.Account.id === 1 ||
      payload.Account.title === username
    )
  );

  const player = req.query.player || process.env.PLAYER;
  const isValidPlayer = player ? player === payload.Player.uuid : true;

  // If the right player is playing a track, display a notification.
  const isValidRequestType = (
    isValidUser &&
    isValidPlayer &&
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
    const statusEmoji = isPlayEvent ? playEmoji : pauseEmoji;

    // If the user has set protected mode, do not change their status if they
    // have a status emoji set that is neither the play or pause emoji.
    const protected = req.query.protected === 'true';
    if (protected) {
      const { profile } = await slack.users.profile.get({ token });
      const { status_emoji } = profile;
      if (status_emoji && ![playEmoji, pauseEmoji].includes(status_emoji.replace(/:/g, ''))) {
        console.warn(`Not updating protected status: ${status_emoji}`);
        return res.sendStatus(200);
      }
    }

    await slack.users.profile.set({
      token,
      profile: JSON.stringify({
        status_text: statusText,
        status_emoji: statusEmoji.length >= 1 ? `:${statusEmoji}:` : statusEmoji
      })
    });
  }

  res.sendStatus(200);
}));

app.use((err, req, res, next) => {
  console.error(err);
  res.sendStatus(200); // As a webhook handler we always want to respond with 200
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log('listening on port ' + port);
});
