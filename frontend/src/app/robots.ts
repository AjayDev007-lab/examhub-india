import { Metadata } from "next";

export default function robots(): {
  rules: {
    userAgent: string;
    allow: string[];
    disallow: string[];
  };
  sitemap: string;
} {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/results", "/hall-tickets", "/jobs", "/official-websites", "/school", "/updates", "/about", "/contact", "/privacy", "/terms"],
      disallow: ["/admin/", "/admin/*", "/dashboard", "/dashboard/*", "/student/", "/student/*", "/api/"],
    },
    sitemap: "https://examhub-india.vercel.app/sitemap.xml",
  };
}
