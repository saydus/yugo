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
assets/logo-card.png     1200x630 logo on white, used for link previews (og:image)
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
| `phone` | `(667) 220-6558` | Header, footer, contact page, mobile bar, system-down band. |
| `email` | `amar@yugocontracting.com` | Also where the forms' email fallback is addressed. |
| `hours` | `Mon to Sat, 8am to 6pm` | Plain text. |
| `domain` | `www.yugocontracting.com` | Canonical URL, `og:url`, `og:image`, structured data. |
| `streetAddress` | `""` | Optional. Empty shows only "Utica, NY". |
| `logoSrc` | `assets/logo-mark.webp` | Header and footer logo. To swap the logo, replace the file or point this at another image. Set to `""` to fall back to a drawn wordmark. |
| `linkedin` | Amar's profile URL | Owner block, footer, contact page, company overview, structured data. `""` removes every LinkedIn link. |
| `ownerEducation` | `Vanderbilt University` | **Confirm with the owner before launch.** Shown as "Education: ..." in the "Meet the owner" block. `""` removes it. School name only; the site states no degree or year. |
| `formEndpoint` | `""` | Optional. See Forms. |

If a required value (`phone`, `email`, `hours`, `domain`) is ever set back to a placeholder, a yellow "Preview only" tag appears on every page.

If the domain changes, also edit the one static `og:image` line in the `<head>` of each HTML file; link-preview crawlers do not run the script.

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

## Company overview PDF

On `partners.html`, the "Print or save as PDF" button prints just the one-page company overview. Choose "Save as PDF" in the print dialog to get a file to email.

## Deploy

Upload the folder's contents as-is to any static host (Netlify, Cloudflare Pages, GitHub Pages, S3, shared hosting). No build command; publish directory is this folder. Point the host's "not found" page at `404.html` if it does not pick it up automatically. All links are relative and the site is flat, so keep the files together at the root of the domain.

## Editing copy

The header and footer are repeated in each HTML file; change them in all five. The site deliberately makes no claims about reviews, years in business, licensing, insurance, warranties, prices or response times. Add those through the credential settings above, and only if they are true.
