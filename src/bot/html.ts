import escapeHtml from "./escapeHtml";

export default function html(title: string, banner: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial scale=1.0" />
    <title>Plex Slack Music Notifications - ${escapeHtml(title)}</title>
    <link rel="stylesheet" href="https://cdn.simplecss.org/simple.min.css" />
    <style>
button {
  width: 100%;
}
fieldset {
  border: none;
}
form {
  display: grid;
}
input:invalid::after {
  content: 'X';
}
    </style>
  </head>
  <body>
    <h1>${escapeHtml(banner)}</h1>
    ${body}
  </body>
</html>`;
}
