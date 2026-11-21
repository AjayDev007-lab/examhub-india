/**
 * Centralized Site and Social Configuration for ExamHub India
 * All social URLs and contact handles are defined here for easy updates.
 */

export const SITE_CONFIG = {
  name: "EXAMHUB INDIA",
  tagline: "All Your Examination Documents and Results in One Place",
  description: "Centralized Educational & Career Platform for Indian Students",
  url: "https://examhub-india.vercel.app",
  social: {
    instagram: {
      username: "@the_smiley_hacker_5933z",
      handle: "the_smiley_hacker_5933z",
      url: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/the_smiley_hacker_5933z/",
      label: "Instagram",
      displayName: "Follow on Instagram",
      description: "Official channel for exam announcements, alerts, and platform news"
    },
    email: "support@examhub.in",
    grievanceEmail: "grievance@examhub.in",
    helpdesk: "+91 11 2338 1234",
    officeAddress: "Institutional Area, Lodhi Road, New Delhi, Delhi 110003, India"
  }
};

export default SITE_CONFIG;
