import express, { Express, Request, Response } from "express";
import fetch from "node-fetch";
import millisecondsToHumanReadable from "./millisecondsToHumanReadable";
import multer from "multer";
import html from "./html";
import {
  PlexWebhookPayload,
  getIsPlexWebhookPlayPayload,
  getIsPlexWebhookResumePayload,
  getIsPlexWebhookStopPayload,
  getIsPlexWebhookPausePayload,
} from "./PlexWebhook";
import getSha1 from "./getSha1";
import escapeHtml from "./escapeHtml";
import getAppRoot from "./getAppRoot";
import renderSlackBlockKit from "./renderSlackBlockKit";
import {
  applicationJsonContentType,
  plexAppProduct,
  wildcardPlexClientIdentifier,
} from "./constants";
import renderOptions from "./renderOptions";
import { postSlackApi, postSlackAuthTest } from "./slackApi";
import fetchUserDevices from "./fetchUserDevices";

function copyToClipboardScript(copyToClipboardPayload: string) {
  return `<pre>${escapeHtml(copyToClipboardPayload)}</pre>
<button onclick="javascript:copyToClipboard()">Copy to Clipboard</button>
<dialog id="copiedDialog">Copied</dialog>
<script>
function copyToClipboard() {
  window.copiedDialog.showModal();
  window.navigator.clipboard.writeText(${JSON.stringify(
    copyToClipboardPayload
  )});
  setTimeout(() => { window.copiedDialog.close(); }, 1000);
}
</script>`;
}

function getWebhookUrl(req: Request, params: WebhookQueryParams) {
  const webhookUrl = new URL(getAppRoot(req, "/webhook"));

  Object.entries(params).forEach(([key, value]) => {
    webhookUrl.searchParams.set(key, value.toString());
  });

  return webhookUrl.toString();
}

function getIsString(value: any): value is string {
  return typeof value === "string";
}

const program = async (
  app: Express,
  config: {
    slackAppClientId: string;
    slackAppClientSecret: string;
    slackAppSigningSecret: string;
  }
) => {
  console.log("[bot] healthy startup");

  const slackAppOauthEntryUrl = `https://slack.com/oauth/v2/authorize?client_id=${
    config.slackAppClientId
  }&user_scope=${["users.profile:read", "users.profile:write"].join(",")}`;

  // Parse url-encoded request body; for Slack slash commands
  app.use(express.urlencoded({ extended: true }));

  app.get("/", async (_req: Request, res: Response) => {
    res.redirect(307, slackAppOauthEntryUrl);
  });

  app.get("/monitoring/health", (_req: Request, res: Response) => {
    res.send("OK");
  });

  app.post("/slash/plexmusic", (req: Request, res: Response) => {
    res.json(
      renderSlackBlockKit({
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `<${slackAppOauthEntryUrl}|Install>`,
            },
          },
        ],
      })
    );
  });

  // Getting the webhook renders instructions on applying the webhook url to the
  // PMS installation.
  app.get("/webhook", (req: Request, res: Response) => {
    const webhookQueryParams = getWebhookQueryParams(req);

    if (webhookQueryParams) {
      const webhookUrl = getWebhookUrl(req, webhookQueryParams);

      res.send(
        html(
          "Webhook URL",
          "Your webhook URL",
          `
${copyToClipboardScript(webhookUrl)}
<p>Add the URL to your <a href="https://app.plex.tv/desktop/#!/settings/webhooks" target="_blank">Plex Webhook Settings</a>.</p>`
        )
      );
    } else {
      res.send(
        html(
          "Missing Parameters",
          "This webhook url is missing necessary parameters.",
          `<a href="${escapeHtml(
            slackAppOauthEntryUrl
          )}">Install this app to generate a webhook url.</a>`
        )
      );
    }
  });

  // plex.tv hits this endpoint with a POST request
  // This endpoint expects content-type multipart/form-data
  // The `payload` portion is a JSON-encoded string representing the webhook
  // event.
  // The `thumb` portion is some image, but we discard it.
  app.post(
    "/webhook",
    multer().single("thumb"),
    async (req: Request, res: Response) => {
      const contentType: string | undefined = req.headers["content-type"];
      const isMultipartFormUpload = contentType?.match(
        /^multipart\/form-data; boundary=(.+)$/
      );

      if (!isMultipartFormUpload) {
        return handleUnsupportedMediaType(
          res,
          "Bad Content-Type: Expected multipart/form-data"
        );
      }

      let payload: PlexWebhookPayload;
      try {
        payload = JSON.parse(req.body.payload);
      } catch {
        return handleUnsupportedMediaType(
          res,
          "Malformed webhook request body; expected JSON-encoded payload"
        );
      }

      const webhookQueryParams = getWebhookQueryParams(req);

      if (!webhookQueryParams) {
        return handleUnsupportedMediaType(res, "Missing necessary parameters");
      }

      const isPlayEvent =
        getIsPlexWebhookPlayPayload(payload) ||
        getIsPlexWebhookResumePayload(payload);

      const isPauseEvent =
        getIsPlexWebhookPausePayload(payload) ||
        getIsPlexWebhookStopPayload(payload);

      if (!isPlayEvent && !isPauseEvent) {
        return handleNoLongerInterested(
          res,
          `Event is not a media play, pause, resume, or stop; received ${payload.event}`
        );
      }

      if (payload.Metadata.type !== "track") {
        return handleNoLongerInterested(
          res,
          `Metadata is not a Track; received ${payload.Metadata.type}`
        );
      }

      // The event from PMS when a server owner plays a track has a different
      // value for the Account.id than a plex.tv account number;
      // For example, the event from PMS has Account.id of "1" even though the
      // plex.tv account is 705030.

      const isValidUser =
        payload.Account.id.toString() === webhookQueryParams.plexUserId.toString();

      if (!isValidUser) {
        return handleNoLongerInterested(
          res,
          `Payload is for a different account; expected ${webhookQueryParams.plexUserId}, received ${payload.Account.id}`
        );
      }

      const isValidClient =
        webhookQueryParams.plexClientIdentifier === payload.Player.uuid ||
        webhookQueryParams.plexClientIdentifier ===
          wildcardPlexClientIdentifier;

      if (!isValidClient) {
        return handleNoLongerInterested(
          res,
          `Payload is for a different client identifier; expected ${webhookQueryParams.plexClientIdentifier}, received ${payload.Player.uuid}`
        );
      }

      const statusText = isPlayEvent
        ? `${
            payload.Metadata.originalTitle || payload.Metadata.grandparentTitle
          } - ${payload.Metadata.title}`
        : "";

      const statusEmoji = isPlayEvent
        ? webhookQueryParams.playEmoji
        : webhookQueryParams.pauseEmoji;

      if (webhookQueryParams.protected) {
        console.log(
          "[/webhook] Protected: protected param is true, so check the current Slack profile status before updating"
        );

        const getProfileResponse = await postSlackApi(
          "https://slack.com/api/users.profile.get",
          webhookQueryParams.slackUserToken,
          {}
        );

        const getProfileJson = await getProfileResponse.json();

        if (!getProfileJson.ok) {
          console.error(
            "[/webhook] Protected: An error occurred checking the current Slack profile status, giving up early"
          );
          res.sendStatus(200);
          return;
        }

        const {
          profile: { status_emoji: currentStatusEmoji },
        } = getProfileJson;

        const isCurrentEmojiEligibleForChange =
          currentStatusEmoji === webhookQueryParams.playEmoji ||
          currentStatusEmoji === webhookQueryParams.pauseEmoji ||
          currentStatusEmoji === "";

        if (!isCurrentEmojiEligibleForChange) {
          console.error(
            `[/webhook] Protected: Current status emoji ${JSON.stringify(
              currentStatusEmoji
            )} is not eligible for change, giving up early`
          );
          res.sendStatus(200);
          return;
        }
      }

      try {
        console.log(
          `[/webhook] Updating profile, status_emoji ${JSON.stringify(
            statusEmoji
          )}, status_text ${JSON.stringify(statusText)}`
        );
        const setProfileResponse = await postSlackApi(
          "https://slack.com/api/users.profile.set",
          webhookQueryParams.slackUserToken,
          {
            profile: {
              status_text: statusText,
              status_emoji: statusEmoji,
            },
          }
        );

        const setProfileJson = await setProfileResponse.json();

        if (!setProfileResponse.ok) {
          console.error(
            `[/webhook] Failed to set profile: ${JSON.stringify(
              setProfileJson,
              null,
              2
            )}`
          );
        } else {
          console.log(
            `[/webhook] Updated profile, status_emoji ${JSON.stringify(
              setProfileJson.profile.status_emoji
            )}, status_text ${JSON.stringify(
              setProfileJson.profile.status_text
            )}`
          );
        }
      } catch (error) {
        console.error(error);
      }

      res.sendStatus(200);
    }
  );

  const plexAppClientIdentifier = getSha1(config.slackAppClientId);

  app.get("/auth/plex", async (req: Request, res: Response) => {
    console.log("[/auth/plex] Begin");

    const {
      linkId,
      linkCode,
      slackUserToken,
    }: { linkId: string; linkCode: string; slackUserToken: string } = req.query;

    const slackUserTokenPromise = postSlackAuthTest(slackUserToken);

    const linkIdCheckPromise = fetch(
      `https://plex.tv/api/v2/pins/${linkId}?${formEncode({
        code: linkCode,
        "X-Plex-Client-Identifier": plexAppClientIdentifier,
      })}`,
      {
        method: "GET",
        headers: {
          accept: applicationJsonContentType,
        },
      }
    )
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        if (!json.authToken) {
          return Promise.reject(
            new Error("linkIdCheck failed, no authToken in response")
          );
        }

        return json;
      });

    const plexUserTokenPromise = linkIdCheckPromise.then(
      ({ authToken }: { authToken: string }) => authToken
    );

    Promise.all([plexUserTokenPromise, slackUserTokenPromise]).then(
      ([plexUserToken, slackUserToken]) => {
        res.redirect(
          307,
          getAppRoot(
            req,
            `/auth/devices?${formEncode({
              plexUserToken,
              slackUserToken,
            })}`
          )
        );
      },
      () => {
        res.redirect(307, slackAppOauthEntryUrl);
      }
    );
  });

  app.get("/auth/devices", async (req: Request, res: Response) => {
    const {
      plexUserToken,
      slackUserToken,
    }: { plexUserToken: string; slackUserToken: string } = req.query;

    const userDevicesPromise = fetchUserDevices(plexUserToken);

    Promise.all([userDevicesPromise, postSlackAuthTest(slackUserToken)]).then(
      ([userDevices, slackUserToken]) => {
        res.send(
          html(
            "Slack App Setup",
            `👋 Hey ${userDevices.user.username}`,
            `
<fieldset>
  <legend>Limit Updates by Client</legend>
  <select id="deviceSelect" style="width: 100%;">
  ${renderOptions(
    userDevices.devices.reduce<Record<string, [string, string][]>>(
      (acc, device) => {
        const isPlayer = device.provides?.split(",").includes("player");
        if (!isPlayer || !device.lastSeenAt) {
          return acc;
        }

        const optgroupLabel = [device.product, device.platform, device.device]
          .filter(Boolean)
          .join(" • ");

        const optgroupOptions = acc[optgroupLabel] || [];
        acc[optgroupLabel] = optgroupOptions;

        const ageMilliseconds =
          new Date().valueOf() - new Date(device.lastSeenAt).valueOf();

        optgroupOptions.push([
          device.clientIdentifier,
          `🙂 ${millisecondsToHumanReadable(ageMilliseconds)} ago ${
            device.clientIdentifier
          }`,
        ]);

        return acc;
      },
      {
        ["Any Client"]: [[wildcardPlexClientIdentifier, "🌎 Any Client"]],
      }
    )
  )}
  </select>
</fieldset>
<fieldset>
  <legend>Play &amp; Pause Emojis</legend>
  <input type="text" name="playEmoji" id="playEmojiInput" placeholder="${defaultPlayEmoji}" value="${defaultPlayEmoji}" />
  <input type="text" name="pauseEmoji" id="pauseEmojiInput" placeholder="${defaultPauseEmoji}" value="${defaultPauseEmoji}" />
</fieldset>
<fieldset>
  <legend>Protect Status Emoji</legend>
  <input type="checkbox" id="protectedCheckboxInput" name="protected" value="true" checked />
  <label for="protectedCheckboxInput">Only update when your current status emoji is
    <span id="protectedCheckboxMessage">
      <i>${defaultPlayEmoji}</i>, <i>${defaultPauseEmoji}</i>
    </span>
  </label>
</fieldset>

<pre id="webhookUrl"></pre>
<button id="copyToClipboardButton">Copy Webhook URL to Clipboard</button>

<p>Add the URL to your <a id="webhookLink" href="https://app.plex.tv/desktop/#!/settings/webhooks">Plex Webhook Settings</a>.</p>

<dialog id="copiedDialog">Copied</dialog>

<script>
(function () {
  const deviceSelectElement = document.getElementById("deviceSelect");
  const webhookUrlElement = document.getElementById("webhookUrl");
  const webhookLinkElement = document.getElementById("webhookLink");
  const copyToClipboardElement = document.getElementById("copyToClipboardButton");
  const copiedDialogElement = document.getElementById("copiedDialog");

  const protectedCheckboxMessageElement = document.getElementById("protectedCheckboxMessage");
  const playEmojiInputElement = document.getElementById("playEmojiInput");
  const pauseEmojiInputElement = document.getElementById("pauseEmojiInput");
  const protectedCheckboxInputElement = document.getElementById("protectedCheckboxInput");

  ${formEncode.toString() /* hack */}

  function refreshWebhookUrl() {
    const formValues = {
      plexUserId: ${JSON.stringify(userDevices.user.id.toString())},
      plexClientIdentifier: deviceSelectElement.value,
      slackUserToken: ${JSON.stringify(slackUserToken)},
      playEmoji: playEmojiInputElement.value,
      pauseEmoji: pauseEmojiInputElement.value
    };

    if (protectedCheckboxInputElement.checked) {
      formValues.protected = "true";
    }

    const nextWebhookUrl = ${JSON.stringify(
      getAppRoot(req, "/webhook?")
    )} + formEncode(formValues);

    webhookUrlElement.innerText = nextWebhookUrl;

    const parts = Array.from(
      new Set([
        playEmojiInputElement.value,
        pauseEmojiInputElement.value
      ].filter(Boolean))
    ).map((emoji) => {
      return '<i>' + emoji + '</i>';
    });

    if (parts.length) {
      parts.push('or is cleared.');
    } else {
      parts.push('cleared.');
    }

    protectedCheckboxMessageElement.innerHTML = parts.join(', ');

    // webhookLinkElement.href = "https://app.plex.tv/desktop/#!/settings/webhooks?newWebhookUrl=" + encodeURIComponent(nextWebhookUrl)
  }

  refreshWebhookUrl();

  deviceSelectElement.addEventListener('change', refreshWebhookUrl);
  protectedCheckboxInputElement.addEventListener('change', refreshWebhookUrl);
  playEmojiInputElement.addEventListener('input', () => {
    playEmojiInputElement.checkValidity();
    refreshWebhookUrl();
  });
  pauseEmojiInputElement.addEventListener('input', refreshWebhookUrl);

  copyToClipboardElement.addEventListener('click', () => {
    copiedDialogElement.showModal();
    window.navigator.clipboard.writeText(webhookUrlElement.innerText);
    setTimeout(() => { copiedDialog.close(); }, 1000);
  });
})();
</script>
    `
          )
        );
      },
      () => {
        res.redirect(307, slackAppOauthEntryUrl);
      }
    );
  });

  app.get("/auth/slack", async (req: Request, res: Response) => {
    console.log("[/auth/slack] Begin");

    const { code, state } = req.query;

    if (!code) {
      console.error('[/auth/slack] Missing "code" query parameter');
      res.redirect(307, slackAppOauthEntryUrl);
      return;
    }

    // Exchange temporary code for a token.
    const oauthJsonResponse = await fetch(
      "https://slack.com/api/oauth.v2.access",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(
            `${config.slackAppClientId}:${config.slackAppClientSecret}`
          )}`,
        },
        body: `code=${encodeURIComponent(code)}`,
      }
    );

    const oauthJson = await oauthJsonResponse.json();

    if (!oauthJson.ok) {
      console.error(
        "[/auth/slack] Code exchange failed; ensure Slack App configuration is correct"
      );

      res.redirect(307, slackAppOauthEntryUrl);
      return;
    }

    const slackUserToken: string = oauthJson.authed_user.access_token;

    const linkResponse = await fetch("https://plex.tv/api/v2/pins", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "X-Plex-Product": plexAppProduct,
        "X-Plex-Client-Identifier": plexAppClientIdentifier,
      },
      body: JSON.stringify({ strong: true }),
    });

    const linkResponseJson = await linkResponse.json();
    const forwardUrl = getAppRoot(
      req,
      `/auth/plex?${formEncode({
        slackUserToken,
        linkId: linkResponseJson.id,
        linkCode: linkResponseJson.code,
      })}slackUserToken=` + slackUserToken
    );

    const authAppUrl = `https://app.plex.tv/auth#?${formEncode({
      clientID: plexAppClientIdentifier,
      code: linkResponseJson.code,
      "context[device][product]": plexAppProduct,
      forwardUrl,
    })}`;

    res.send(
      html(
        "Connect Plex Account",
        "Plex Slack Music Notifications",
        `
<form action="${escapeHtml(authAppUrl)}" method="get">
  <button>Connect Plex Account</button>
</form>
`
      )
    );
  });
};

interface WebhookQueryParams {
  plexUserId: string;
  plexClientIdentifier: string;
  slackUserToken: string;
  protected: boolean;
  playEmoji: string;
  pauseEmoji: string;
}

const defaultPlayEmoji = ":sound:";
const defaultPauseEmoji = "";

// This function enforces that necessary parameters are present by
function getWebhookQueryParams(req: Request): WebhookQueryParams | undefined {
  const plexUserId = req.query.plexUserId;
  const plexClientIdentifier = req.query.plexClientIdentifier;
  const slackUserToken = req.query.slackUserToken;

  const playEmoji = req.query.playEmoji;
  const pauseEmoji = req.query.pauseEmoji;

  return getIsString(plexUserId) &&
    getIsString(plexClientIdentifier) &&
    getIsString(slackUserToken) &&
    getIsString(playEmoji) &&
    getIsString(pauseEmoji)
    ? {
        plexUserId,
        plexClientIdentifier,
        slackUserToken,
        protected: req.query.protected === "true",
        playEmoji,
        pauseEmoji,
      }
    : undefined;
}

function handleUnsupportedMediaType(res: Response, error: string) {
  console.error(`[/webhook] Unsupported Media Type Error ${error}`);
  res.status(415);
  res.send({ error });
}

function handleNoLongerInterested(res: Response, reason: string) {
  console.log(`[/webhook] Ignoring event; ${reason}`);
  res.sendStatus(200);
}

function formEncode(obj: object): string {
  return Object.entries(obj)
    .map((pair: [string, string]) => pair.map(encodeURIComponent).join("="))
    .join("&");
}

export default program;
