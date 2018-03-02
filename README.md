### Before running this app, you'll first need to do the following:

- Figure out the identifier of the player you want to control (e.g. in Plexamp look for user:identifier in config.json):
```
# grep identifier -m 1 ~/Library/Application\ Support/Plexamp/config.json
```
- Make yourself a legacy slack token on [this page](https://api.slack.com/custom-integrations/legacy-tokens).


### To run the app locally:

- Install [node.js](https://nodejs.org/en/).
- Clone the repository.
- Install dependencies using `npm install`.
- Run the app as follows:
```
$ TOKEN=<token> \
  PLAYER=<player> \
  [USERNAME=<username>]
  node index.js
```

> ⚠️ You'll need to use the USERNAME env variable if you're playing music as a shared user.

- Add the webhook to https://app.plex.tv/web/app#!/account/webhooks replacing the `playEmoji` and `pauseEmoji` params with your preferred Slack emoji; e.g.:
  * http://localhost:10000?playEmoji=speaker&pauseEmoji=mute


### Alternatively, you can deploy straight to Heroku:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

- Then add a webhook to https://app.plex.tv/web/app#!/account/webhooks with the url for the Heroku app; e.g.:
  * https://my-plexamp-notifier.herokuapp.com
