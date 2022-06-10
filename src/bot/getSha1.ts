import crypto from "crypto";

export default function getSha1(input: string): string {
  const shasum = crypto.createHash("sha1");

  shasum.update(input);
  return shasum.digest("hex");
}
