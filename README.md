# Before you begin

### 1. Find the identifier of the player you want to control.
- In Plexamp, look for `"user": "identifier"` in `config.json`:

   - Mac: `~/Library/Application Support/Plexamp/config.json`.
   - Windows: `C:\Users\<username>\AppData\Local\Plexamp\Plexamp\config.json`.

### 2. Create a legacy slack token on [this page](https://api.slack.com/custom-integrations/legacy-tokens).

### 3. Make sure you have Webhooks enabled in PMS.  
- `Settings` → `Server` → `Network (Show Advanced)` → ☑️ `Webhooks`

---

# Running the app

## Option 1 — Deploy straight to Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Option 2 — Run the app locally

- Install [node.js](https://nodejs.org/en/) version 10 or higher, use of [nvm](https://github.com/nvm-sh/nvm) is recommended.
- Install [yarn](https://yarnpkg.com/lang/en/docs/install/).
- Clone the repository.
- Install dependencies using `yarn`.
- Run the app as follows:
```
$ yarn start
```

The app is now running at http://localhost:8000

## Option 3 - Run the app in Docker

```bash
$ yarn docker:build
$ yarn docker:start
```

The app is now running at http://localhost:8000


# Configure the webhook

In your [Plex account settings](https://app.plex.tv/desktop#!/account/webhooks) add a webhook pointing to where the app is running.

- If you used the Heroku deployment button the URL would look like `https://<my-heroku-app>.herokuapp.com`
- If you are running the app on the same computer as PMS the URL would look like `http://localhost:8000`

## Available parameters

You can provide parameters to the app either via the querystring or environment variables. If both are provided, the querystring value will take precedence.

| Query Parameter | Environment Variable | Description
| --- | --- | --- |
| token | TOKEN | Your [Slack token](https://api.slack.com/custom-integrations/legacy-tokens). **Required** for this app to be able to change your status. |
| username | USERNAME | Your Plex username. **Required** if you are playing music from a shared server, otherwise **optional**. |
| player | PLAYER | The client identifier of the player you want to send notifications for. If not provided, your status will update from any Plex client your account is playing music on. |
| playEmoji | PLAY_EMOJI | The Slack emoji to use when playing. Do not include colons, i.e. `plexamp-outline`. If not provided will clear the emoji in your status.  |
| pauseEmoji | PAUSE_EMOJI | The Slack emoji to use when paused. Do not include colons, i.e. `plexamp-outline-desaturated`. If not provided will clear the emoji in your status. |
| protected | | If `true`, your status will be protected from changes if your status emoji is something other than `playEmoji` or `pauseEmoji` |

### Full example 

```
https://my-music-webhooks.herokuapp.com?token={slack_token}&username={plex_username}&player={player_client_identifier}&playEmoji={playing_emoji}&pauseEmoji={paused_emoji}
```
