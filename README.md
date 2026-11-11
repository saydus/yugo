# Yugo Contracting website

Plain static files: HTML, one stylesheet, one script. No build step, no dependencies, no trackers. The only outside request is one Google Font (Barlow Condensed, for headings); without it the headings fall back to a system font.

```
index.html      Home
services.html   Each service explained
partners.html   Property managers, landlords, investors, builders, businesses:
                why an owner-operator, capabilities table, account form, printable company overview
contact.html    "Request a call" form + phone / email / area
404.html        Not-found page
assets/styles.css
assets/site.js           <- all settings live in CONFIG at the top of this file
assets/logo-mark.webp    header and footer logo (YUGO + star + CONTRACTING LLC), transparent
assets/logo.webp         full lockup with descriptor and tagline, transparent (company overview)
assets/logo.png, logo-mark.png   PNG copies of the two above
assets/logo-card.png     1200x630 logo on white (structured data image)
assets/yugo-promo.mp4    7.5-second promo video: link-preview video (og:video) and the clip on the home page
assets/yugo-promo-poster.jpg   its last frame: link-preview image (og:image) and the video poster
assets/favicon.png, apple-touch-icon.png
```

## Preview

Double-click `index.html`, or serve the folder:

```
cd yugo-site
python3 -m http.server 8000     # then open http://localhost:8000
```

## Settings: `CONFIG` in `assets/site.js`

Nothing else needs editing.

| Key | Current value | Notes |
| --- | --- | --- |
| `phone` | `(315) 749-3430` | Header, footer, contact page, mobile bar, system-down band. |
| `email` | `amar@yugocontracting.com` | Also where the forms' email fallback is addressed. |
| `hours` | `Every day, 8am to 8pm` | Plain text. |
| `domain` | `www.yugocontracting.com` | Canonical URL, `og:url`, `og:image`, structured data. |
| `streetAddress` | `""` | Optional. Empty shows only "Utica, NY". |
| `logoSrc` | `assets/logo-mark.webp` | Header and footer logo. To swap the logo, replace the file or point this at another image. Set to `""` to fall back to a drawn wordmark. |
| `linkedin` | Amar's profile URL | Owner block, footer, contact page, company overview, structured data. `""` removes every LinkedIn link. |
| `ownerEducation` | `Vanderbilt University` | **Confirm with the owner before launch.** Shown as "Education: ..." in the "Meet the owner" block. `""` removes it. School name only; the site states no degree or year. |
| `formEndpoint` | `""` | Optional. See Forms. |

If a required value (`phone`, `email`, `hours`, `domain`) is ever set back to a placeholder, a yellow "Preview only" tag appears on every page.

The domain is also hard-coded in each page: the `canonical`, `og:url`, `og:image`, `og:video*` and `twitter:image` tags in every `<head>` use `https://www.yugocontracting.com`, because link-preview crawlers (iMessage, LinkedIn, Facebook) do not run scripts. If the domain changes, find-and-replace that address in all five HTML files.

## Credentials: the fastest way to look established

These are empty by default and render nothing at all. Fill one in and its section appears on its own. Only add statements that are true and current.

| Key | Appears as |
| --- | --- |
| `licenseLine` | A "Credentials" section on home and partners, the footer, and the company overview |
| `insuranceLine` | Same "Credentials" section and company overview |
| `certifications` (list of strings) | Same "Credentials" section and company overview |
| `reviews` (list of `{ quote, name, town }`) | A "What customers say" section on home and partners. Real reviews, used with permission. |
| `googleReviewsUrl` | A "Read reviews on Google" button in that section |
| `projects` (list of `{ title, town, summary, image }`) | A "Recent jobs" gallery on home. `image` is optional; put photos in `assets/`. |

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

## Promo video and link previews

Sharing a page link in Messages and similar apps shows `assets/yugo-promo-poster.jpg`, and where the app supports it, plays `assets/yugo-promo.mp4`. The same clip sits beside the owner block on the home page (muted, plays only while on screen, never on its own for visitors who ask for reduced motion).

- To replace the video, export a new MP4 with the same name and settings: H.264, 1280x720, 30 fps, yuv420p, `-movflags +faststart`, a few seconds long, well under 3 MB. Replace the poster JPG with a 1280x720 frame from it. If the size changes, update the `og:video:width/height` and `og:image:width/height` tags and the `<video>` width/height.
- Do not bake a phone number into the video; it cannot be changed later.
- Apps cache link previews, sometimes for days. After a change, an old preview can keep showing; sending the link with a harmless query string (for example `?v=2`) usually forces a fresh one.
- The video must be served over HTTPS from the same domain as the page, with the `video/mp4` content type (static hosts do this by default).

## Company overview PDF

On `partners.html`, the "Print or save as PDF" button prints just the one-page company overview. Choose "Save as PDF" in the print dialog to get a file to email.

## Deploy

Upload the folder's contents as-is to any static host (Netlify, Cloudflare Pages, GitHub Pages, S3, shared hosting). No build command; publish directory is this folder. Point the host's "not found" page at `404.html` if it does not pick it up automatically. All links are relative and the site is flat, so keep the files together at the root of the domain.

## Editing copy

The header and footer are repeated in each HTML file; change them in all five. The site deliberately makes no claims about reviews, years in business, licensing, insurance, warranties, prices or response times. Add those through the credential settings above, and only if they are true.
