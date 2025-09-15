# Bug Report: Unable to Create New Account or Authenticate

**Date:** 2025-09-15

## Description

Users are currently unable to create new accounts or authenticate with existing API keys. The sign-up page returns a 404 error, and the API key authentication consistently fails with an "invalid or expired" message.

## Steps to Reproduce

### Sign-up Flow

1. Navigate to the sign-in page: `https://taskmaster-speakeasyapi.vercel.app/sign-in`
2. Attempt to find a "Sign Up" or "Create Account" link.
3. Observe that there is no clear way to navigate to a sign-up page.
4. Manually navigating to a potential sign-up URL (e.g., `/sign-up`) results in a 404 error.

### API Key Authentication

1. Navigate to the sign-in page: `https://taskmaster-speakeasyapi.vercel.app/sign-in`
2. Enter a valid API key in the authentication field.
3. Click the sign-in button.
4. Observe the "invalid or expired" error message.

## Expected Behavior

*   **Sign-up:** Users should be able to navigate to a sign-up page from the sign-in page, and the sign-up page should load correctly.
*   **API Key Authentication:** Users should be able to authenticate successfully with a valid API key.

## Actual Behavior

*   **Sign-up:** The sign-up page is inaccessible and returns a 404 error.
*   **API Key Authentication:** API key authentication fails with an "invalid or expired" error, even for valid keys.

## Environment

*   **URL:** `https://taskmaster-speakeasyapi.vercel.app/sign-in`
*   **Browser:** (Not specified)
*   **Operating System:** (Not specified)

## Additional Information

This bug prevents any new users from signing up and using the service. It also blocks existing users who rely on API key authentication.

---

## Analysis

**Date:** 2025-09-15
**Analyzed By:** Gemini

### Summary

There are two distinct issues identified:

1.  **Incorrect Sign-up URL:** The link for signing up on the sign-in page is pointing to `/sign-up`. However, the actual sign-up page is located at `/sign-up/email`. This results in a 404 error when users try to navigate to the sign-up page.

2.  **API Key Authentication Configuration:** The authentication system (`better-auth`) is not correctly configured to handle API key validation. When an API key is created, a `projectId` is associated with it. However, the `apiKey` schema within the authentication plugin is missing the `projectId` field. This discrepancy causes the validation to fail, resulting in the "invalid or expired" error message even for valid keys.