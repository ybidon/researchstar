"use client";

// OAuth buttons are disabled until OAuth providers are configured
// To enable, add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET to environment variables

export function OAuthButtons() {
  // OAuth is not configured - return null to hide buttons
  return null;
}
