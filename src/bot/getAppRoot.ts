import { Request } from "express";

export default function getAppRoot(req: Request, suffix?: string) {
  return `https://${req.hostname}${req.baseUrl}${suffix || ""}`;
}
