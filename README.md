# Yugo Contracting website

Plain static files: HTML, one stylesheet, one script. No build step, no dependencies, no trackers.

```
index.html      Home
services.html   Each service explained
partners.html   Property managers, landlords, investors, builders, businesses + "Set up an account" form
contact.html    "Request a call" form + phone / email / area
404.html        Not-found page
assets/styles.css
assets/site.js  <- all settings live in CONFIG at the top of this file
assets/favicon.svg
```

## Preview

Double-click `index.html`, or serve the folder:

```
cd yugo-site
python3 -m http.server 8000     # then open http://localhost:8000
```

## Before launch: fill in the placeholders

Everything unknown is in the `CONFIG` object at the top of `assets/site.js`. Nothing else needs editing.

| Key | Default (placeholder) | Notes |
| --- | --- | --- |
| `phone` | `(315) 000-0000` | Required. Shown in header, footer, contact page and mobile bar. |
| `email` | `name@example.com` | Required. Also where the form's email fallback is addressed. |
| `hours` | `(hours not set)` | Required. Plain text. |
| `domain` | `www.example.com` | Required. Used for the canonical URL, `og:url` and structured data. |
| `streetAddress` | `""` | Optional. Leave empty to show only "Utica, NY". |
| `licenseLine` | `""` | Optional. Hidden unless filled. Only add a licence/insurance statement that is true and current. |
| `formEndpoint` | `""` | Optional. See below. |

While any of the four required values is still a placeholder, every page shows a yellow "Preview only" tag in the bottom corner listing what is not set. When the tag is gone, the placeholders are done.

## Forms

All three forms (the short one in the home hero, `contact.html`, `partners.html`) share the code in `assets/site.js`.

- `formEndpoint` empty (default): submitting opens the visitor's email app with a pre-filled message to `CONFIG.email`. The page says so before and after. Nothing is sent until they press send.
- `formEndpoint` set: the form sends a JSON `POST` to that URL. Any 2xx response shows "Request sent"; anything else shows an error with an email fallback link.

Payload:

```json
{
  "form": "request-call",
  "subject": "Call request: Jane Doe (Utica)",
  "submittedAt": "2026-01-01T12:00:00.000Z",
  "page": "contact.html",
  "fields": { "name": "...", "phone": "...", "email": "...", "town": "...", "details": "...", "best_time": "..." }
}
```

`form` is `quick-call` (home hero: `name`, `phone`, `details`), `request-call` or `partner-account`. The account form requires only `company`, `name`, `phone` and `type`; its fields are `company`, `name`, `role`, `type`, `phone`, `email`, `units`, `needs` (array), `notes`.

Any form service or small serverless function that accepts JSON works. The endpoint must allow cross-origin requests (CORS) from the site's domain, including the `Content-Type: application/json` preflight. A hidden honeypot field (`website`) drops basic bots in the browser; do real spam filtering at the endpoint.

## Deploy

Upload the folder's contents as-is to any static host (Netlify, Cloudflare Pages, GitHub Pages, S3, shared hosting). No build command; publish directory is this folder. Point the host's "not found" page at `404.html` if it does not pick it up automatically. All links are relative and the site is flat, so keep the files together at the root of the domain.

## Editing copy

The header and footer are repeated in each HTML file; change them in all five. The site deliberately makes no claims about reviews, years in business, licensing, insurance, warranties, prices or response times. Add those only if they are true.
