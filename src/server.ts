import express, { Request, Response } from "express";
import process from "process";

const {
  SLACK_APP_CLIENT_ID: slackAppClientId,
  SLACK_APP_CLIENT_SECRET: slackAppClientSecret,
  SLACK_APP_SIGNING_SECRET: slackAppSigningSecret,
} = process.env;

const app = express();

// Parse url-encoded request body; for Slack slash commands
app.use(express.urlencoded({ extended: true }));

let appStartupPromise;
if (slackAppClientId && slackAppClientSecret && slackAppSigningSecret) {
  appStartupPromise = import("./bot/healthy").then(({ default: program }) => {
    return program(app, {
      slackAppClientId,
      slackAppClientSecret,
      slackAppSigningSecret,
    });
  });
} else {
  appStartupPromise = import("./bot/needsSlackConfig").then(({ default: program }) => {
    return program(app);
  });
}

appStartupPromise ||= Promise.resolve();

appStartupPromise.then(() => {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`listening on port ${port}`);
  });

  ["SIGHUP", "SIGINT", "SIGTERM"].forEach((signal) =>
    process.on(signal, () => process.exit())
  );
});
