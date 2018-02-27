In order to run this app:

- Install [node.js](https://nodejs.org/en/).
- Clone the repository.
- Install dependencies using `npm install`.
- Figure out the identifier of the player you want to control (e.g. in Plexamp look for user:identifier in config.json)
```
# grep identifier -m 1 ~/Library/Application\ Support/Plexamp/config.json
```
- Make yourself a legacy slack token on [this page](https://api.slack.com/custom-integrations/legacy-tokens).

Then run the app as follows:

```
$ PLAY_EMOJI="speaker" \
  PAUSE_EMOJI="mute" \
  TOKEN=<token> \
  PLAYER=<player>
  [USERNAME=<username>]
  node index.js
```

> ⚠️ You'll need to use the USERNAME env variable if you're playing music as a shared user.

Finally, add the webhook to https://app.plex.tv/web/app#!/account/webhooks (it'll be http://localhost:10000).

Alternatively, deploy straight to Heroku now:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)
