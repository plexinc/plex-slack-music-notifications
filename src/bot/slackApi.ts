import { applicationJsonContentType } from "./constants";
import fetch from "node-fetch";

export function postSlackApi(url: string, bearer: string, body: object) {
  return fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${bearer}`,
      "content-type": applicationJsonContentType,
    },
    body: JSON.stringify(body),
  });
}

export function postSlackAuthTest<T extends string>(slackUserToken: T): Promise<T> {
  return postSlackApi("https://slack.com/api/auth.test", slackUserToken, {})
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      if (!json.ok) {
        return Promise.reject(new Error("postSlackAuthTest failed"));
      }

      return slackUserToken;
    });
}
