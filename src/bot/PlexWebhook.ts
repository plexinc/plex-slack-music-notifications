interface PlexWebhookPayloadBase {
  Account: {
    id: number;
    title: string;
  };
  Metadata: {
    type: string;
    originalTitle?: string;
    grandparentTitle?: string;
    title?: string;
  };
  Player: {
    uuid: string;
  };
}

interface PlayPayload extends PlexWebhookPayloadBase {
  event: "media.play";
}

interface ResumePayload extends PlexWebhookPayloadBase {
  event: "media.resume";
}

interface PausePayload extends PlexWebhookPayloadBase {
  event: "media.pause";
}

interface StopPayload extends PlexWebhookPayloadBase {
  event: "media.stop";
}

export type PlexWebhookPayload = PlayPayload | ResumePayload | PausePayload | StopPayload;

export function getIsPlexWebhookPlayPayload(
  payload: PlexWebhookPayload
): payload is PlayPayload {
  return payload.event === "media.play";
}

export function getIsPlexWebhookResumePayload(
  payload: PlexWebhookPayload
): payload is ResumePayload {
  return payload.event === "media.resume";
}

export function getIsPlexWebhookPausePayload(
  payload: PlexWebhookPayload
): payload is PausePayload {
  return payload.event === "media.pause";
}

export function getIsPlexWebhookStopPayload(
  payload: PlexWebhookPayload
): payload is StopPayload {
  return payload.event === "media.stop";
}
