import type { MetadataRoute } from "next";
import { BOARD_KINDS, SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/about",
    "/events",
    "/contest",
    "/boards",
    "/join",
    "/terms",
    "/privacy",
    "/bylaws",
  ];
  const boardRoutes = BOARD_KINDS.map((b) => `/boards/${b.kind}`);

  return [...staticRoutes, ...boardRoutes].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));
}
