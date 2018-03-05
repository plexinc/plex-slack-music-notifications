# Before you begin

### 1. Find the identifier of the player you want to control.
- In Plexamp, look for `"user": "identifier"` in `config.json`:

   - Mac: `~/Library/Application Support/Plexamp/config.json`.
   - Windows: `C:\Users\<username>\AppData\Local\Plexamp\Plexamp\config.json`.

### 2. Create a legacy slack token on [this page](https://api.slack.com/custom-integrations/legacy-tokens).

### 3. Make sure you have Webhooks enabled in PMS.  
- `Settings` → `Server` → `Network (Show Advanced)` → ☑️ `Webhooks`

---

# Option 1 — Deploy straight to Heroku

### 1. Press this button
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

### 2. Add a Webhook
- Go to https://app.plex.tv/web/app#!/account/webhooks and create a new webhook with the url for the Heroku app you just deployed:  

  `https://<my-heroku-app>.herokuapp.com`

---

# Option 2 — Run the app locally

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

- Add a webhook to https://app.plex.tv/web/app#!/account/webhooks, replacing the `playEmoji`, `pauseEmoji`, and `player` params with your preferred Slack emoji and player identifier:

  `http://localhost:10000?playEmoji=plexamp-outline&pauseEmoji=plexamp-outline-desaturated&player=android-ab73d9387`
