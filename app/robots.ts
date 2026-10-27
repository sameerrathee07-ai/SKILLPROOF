import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://skillproof.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/problems",
          "/about",
          "/pricing",
          "/services",
          "/solvers/",
          "/privacy",
          "/terms",
        ],
        disallow: ["/admin/", "/api/", "/org/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
