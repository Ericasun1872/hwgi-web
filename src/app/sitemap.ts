import type { MetadataRoute } from "next";
import { getAllBoardPosts, getChapterEvents } from "@/lib/firestore";
import { BOARD_KINDS, SITE_URL } from "@/lib/site";

function parseDate(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** 사이트 공개·주요 개편 기준일 (정적 경로 lastmod) */
const SITE_LASTMOD = new Date("2026-09-13T00:00:00.000Z");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: {
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }[] = [
    { path: "", priority: 1, changeFrequency: "weekly" },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" },
    { path: "/events", priority: 0.8, changeFrequency: "weekly" },
    { path: "/contest", priority: 0.8, changeFrequency: "weekly" },
    { path: "/boards", priority: 0.9, changeFrequency: "daily" },
    { path: "/ebooks", priority: 0.7, changeFrequency: "weekly" },
    { path: "/join", priority: 0.7, changeFrequency: "monthly" },
    { path: "/sponsors", priority: 0.5, changeFrequency: "monthly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/bylaws", priority: 0.3, changeFrequency: "yearly" },
  ];

  const boardIndexRoutes = BOARD_KINDS.map((b) => ({
    url: `${SITE_URL}/boards/${b.kind}`,
    lastModified: SITE_LASTMOD,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const ebookRoutes = BOARD_KINDS.map((b) => ({
    url: `${SITE_URL}/ebooks/${b.kind}`,
    lastModified: SITE_LASTMOD,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const staticEntries = staticRoutes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: SITE_LASTMOD,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  let postEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await getAllBoardPosts();
    postEntries = posts.map((post) => {
      const kind = String(post.kind || "poetry");
      return {
        url: `${SITE_URL}/boards/${kind}/${post.id}`,
        lastModified: parseDate(post.createdAt) ?? SITE_LASTMOD,
        changeFrequency: "monthly" as const,
        priority: 0.65,
      };
    });
  } catch {
    postEntries = [];
  }

  let eventsLastMod = SITE_LASTMOD;
  try {
    const events = await getChapterEvents();
    for (const e of events) {
      // dateLabel is free text; keep page lastmod at site baseline unless we have ISO elsewhere
      void e;
    }
  } catch {
    // ignore
  }

  const eventsEntry = {
    url: `${SITE_URL}/events`,
    lastModified: eventsLastMod,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  };

  // /events already in static — replace with dated entry
  const withoutDupEvents = staticEntries.filter(
    (e) => e.url !== `${SITE_URL}/events`,
  );

  return [
    ...withoutDupEvents,
    eventsEntry,
    ...boardIndexRoutes,
    ...ebookRoutes,
    ...postEntries,
  ];
}
