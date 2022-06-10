import { Express, Request, Response } from "express";
import renderSlackBlockKit from "./renderSlackBlockKit";
import getAppRoot from "./getAppRoot";
import html from "./html";
import base64EncodedSecretsInstructionsImage from "./base64EncodedSecretsInstructionsImage";
import escapeHtml from "./escapeHtml";
import { plexAppProduct } from "./constants";

async function needsSlackConfig(app: Express) {
  console.log("[bot] needsSlackConfig startup");

  function getManifestYml(appRoot: string, slashCommand: string | undefined) {
    const manifestParts = [
      `display_information:
  name: ${plexAppProduct}
  description: Plex → Slack Status
  background_color: "#424242"
  long_description: "Process incoming webhooks from Plex and update your Slack Status with currently-playing music.\r

    \r

    • 🔊 Customizable; Choose your own \`play\` and \`pause\` status emojis\r

    • 🔬 Focused; Process updates from just the client you want"
features:
  app_home:
    home_tab_enabled: true
    messages_tab_enabled: false
    messages_tab_read_only_enabled: true
  bot_user:
    display_name: ${plexAppProduct}
    always_online: true`,
      slashCommand
        ? `      slash_commands:
        - command: ${slashCommand}
          url: REPLACE_APP_ROOT/slash/plexmusic
          description: Get webhook URL
          should_escape: false`
        : undefined,
      `oauth_config:
  redirect_urls:
    - REPLACE_APP_ROOT/auth/slack
  scopes:
    user:
      - users.profile:write
      - users.profile:read
    bot:
      - incoming-webhook`,
      slashCommand
        ? `
      - commands`
        : undefined,
      `settings:
  org_deploy_enabled: false
  socket_mode_enabled: false
  token_rotation_enabled: false
`,
    ];

    return manifestParts
      .filter(Boolean)
      .join("\n")
      .replace(/REPLACE_APP_ROOT/g, appRoot);
  }
  // Landing page and Slack App setup button
  app.get("/", async (req: Request, res: Response) => {
    const manifestYml = getManifestYml(getAppRoot(req), undefined);

    res.send(
      html(
        "Slack App Setup",
        "Configure Me",
        `
<a href="https://api.slack.com/apps?new_app=1&manifest_yaml=${encodeURIComponent(
          manifestYml
        )}" target="_blank">
  <button style="submit">Create a Slack App in your Workspace</button>
</a>
<p>After the Slack app is installed, get the following secrets from your App Credentials, and add them to this server's startup environment variables.</p>
<pre>
SLACK_APP_CLIENT_ID           Client ID
SLACK_APP_CLIENT_SECRET       Client Secret
SLACK_APP_SIGNING_SECRET      Signing Secret
</pre>
<p>The Slack App Credentials screen looks like this.</p>
<img style="max-width: 100%;" src="data:image/png;base64,${base64EncodedSecretsInstructionsImage}" alt="Screenshot showing Slack App configuration values which need to be added as app startup environment variables." />
<pre>${escapeHtml(manifestYml)}</pre>
`
      )
    );
  });

  // Slack slash command
  app.post("/slash/plexmusic", (req: Request, res: Response) => {
    res.json(
      renderSlackBlockKit({
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "❌ App needs configuration!",
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `<${getAppRoot(req)}|Instructions>`,
            },
          },
        ],
      })
    );
  });

  // Getting the webhook renders instructions on applying the webhook url to the
  // PMS installation.
  app.get("/webhook", (req: Request, res: Response) => {
    res
      .status(500)
      .send(`Needs configuration. Visit ${getAppRoot(req)}/ to configure.`);
  });

  // plex.tv hits this endpoint with a POST request
  app.post("/webhook", (req: Request, res: Response) => {
    res
      .status(500)
      .send(`Needs configuration. Visit ${getAppRoot(req)}/ to configure.`);
  });
}

export default needsSlackConfig;
