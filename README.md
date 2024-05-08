# Running the app

## Deploy the app

### Option 1 — Deploy straight to Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Install the Slack App and add Slack Secrets

Once the app is running without configuration it can guide you through setting up the Slack app and configuring your webhook URL.

Visit the root of the running app to get a link to provision the Slack app, and instructions on configuring the environment variables this app needs.

| Environment Variable | Slack App Label |
|-|-|
| `SLACK_APP_CLIENT_ID` | Client ID |
| `SLACK_APP_CLIENT_SECRET` | Client Secret |
| `SLACK_APP_SIGNING_SECRET` | Signing Secret |

## Configure the Webhook

Once the Slack app has been provisioned and this app's environment variables have been configured, visit the root of the running app again to tbe begin the Slack oauth process.
* Install the app for your Slack user
* Click the `Connect Plex Account` button and sign in to your Plex account
* Configure your webhook url
   * The `playEmoji` and `pauseEmoji` are used as your Slack account's status emoji
   * Updates can be limited to those coming from a specific device / client
   * `protected` status controls whether or not Plex playbacks will overwrite your Slack status

## Install the Webhook

Follow the instructions to copy the webhook URL to the clipboard, then add it to your [Plex Webhook settings](https://app.plex.tv/desktop#!/account/webhooks).
