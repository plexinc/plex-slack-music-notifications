import fetch from "node-fetch";
import { applicationJsonContentType } from "./constants";

type DevicesJson = readonly {
  clientIdentifier: string;
  provides?: string;
  product?: string;
  platform?: string;
  device?: string;
  lastSeenAt?: string;
}[];
type UserJson = { id: number; username: string; authToken: string };

interface UserDevices {
  user: UserJson;
  devices: DevicesJson;
}

export default async function fetchUserDevices(
  plexUserTokenInputValue: string
): Promise<UserDevices> {
  const abortController = new AbortController();

  const devicesResponsePromise = fetch("https://plex.tv/api/v2/devices", {
    method: "GET",
    headers: {
      accept: applicationJsonContentType,
      "x-plex-token": plexUserTokenInputValue,
    },
    signal: abortController.signal,
  }).then((response) => {
    return response.status === 200
      ? (response.json() as Promise<DevicesJson>)
      : Promise.reject();
  });

  const userResponsePromise = fetch("https://plex.tv/api/v2/user", {
    method: "GET",
    headers: {
      accept: applicationJsonContentType,
      "x-plex-token": plexUserTokenInputValue,
    },
    signal: abortController.signal,
  }).then((response) => {
    return response.status === 200
      ? (response.json() as Promise<UserJson>)
      : Promise.reject();
  });

  return Promise.all([devicesResponsePromise, userResponsePromise]).then(
    ([devicesJson, userJson]) => {
      return { user: userJson, devices: devicesJson };
    },
    () => {
      abortController.abort();
      return Promise.reject();
    }
  );
}

