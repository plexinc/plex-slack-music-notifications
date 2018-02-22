In order to run this app:
 
- Install [node.js](https://nodejs.org/en/).
- Clone the repository.
- Install dependencies using `npm install`.
- Figure out the identifier of the player you want to control (e.g. in Plexamp look for user:identifier in config.json)
- Make yourself a legacy slack token on [this page](https://api.slack.com/custom-integrations/legacy-tokens).

Then run the app as follows:

```
$ PAUSE_EMOJI=<paused-emoji> PLAY_EMOJI=<playing-emoji> TOKEN=<token> PLAYER=<player> node index.js
```

Finally, add the webhook to https://app.plex.tv/web/app#!/account/webhooks (it'll be http://localhost:10000).
