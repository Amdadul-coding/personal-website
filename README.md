# Personal website

A minimal Vite + React + TypeScript starter with React Router.

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Edit the placeholder pages in `src/Pages`.
Shared header and footer components live in `src/Components`, and global styles
live in `src/index.css`.

```sh
npm run build
npm run preview
```

The production build is written to `dist`. When deploying, configure your host
to serve `index.html` for application routes so direct page visits work.

## Contact email and hosting

The contact form posts to `/api/contact`. Go validates the submission and sends
an email through [Resend](https://resend.com/docs/api-reference/emails/send-email).
The email includes the visitor's name, email address, and message in its body,
so you can compose a separate email to the visitor yourself.
The form shows “Sent” only after Resend accepts the email. Provider failures show
an error and preserve the form. Acceptance does not guarantee inbox delivery;
check Resend's delivery logs if an email does not arrive. There is no message database or retry queue.

### Email setup

Create a Resend API key and verify a sending domain in Resend. Configure these
server environment variables (never put the API key in a `VITE_` variable):

| Variable | Value |
| --- | --- |
| `RESEND_API_KEY` | Your Resend API key |
| `CONTACT_FROM_EMAIL` | `Portfolio <contact@your-verified-domain.com>` |
| `CONTACT_TO_EMAIL` | Your inbox address |

The server refuses to start if configuration is missing or email addresses are invalid.

### Local development

Requires Go 1.25+. Copy `backend/.env.example` to `backend/.env` and replace its
placeholder values. The file is ignored by Git and loads automatically when you
start Go from the backend directory. Existing environment variables take precedence;
the file is optional on hosting platforms that supply those variables directly.

```sh
cd backend
go run .
```

Run `npm run dev` in another terminal from the repository root. Vite proxies
`/api` to Go at `127.0.0.1:8080`. Configured submissions send real email.

### Deploy on Cloudflare Pages (free)

The `functions/api/contact.ts` Pages Function replaces Go on Cloudflare and
serves the same `/api/contact` endpoint. The React form needs no changes.
The Go backend remains available for local development and Docker hosting.

1. Push this repository to GitHub.
2. In Cloudflare, open **Workers & Pages**, choose the **Pages** Git import
   workflow, and connect this repository with production branch `main`.
3. Use build command `npm run build`, output directory `dist`, and the repository
   root as the root directory. Do not select Docker.
4. In the Pages project's **Settings → Variables and Secrets**, add
   `RESEND_API_KEY` as a secret and `CONTACT_FROM_EMAIL` and `CONTACT_TO_EMAIL`
   as runtime variables, using your local email settings. Use a Resend-verified
   sender. Configure Production (and Preview separately if you want preview
   contact forms to send real email). Never use `VITE_` for credentials.
5. Redeploy after adding the settings. Open the provided `pages.dev` URL,
   refresh `/about`, and test the contact form. Check Resend delivery logs.

Cloudflare does not read `backend/.env`. Only the three email settings above
are needed; `PORT`, `STATIC_DIR`, and `CONTACT_ADDR` are for Go only.
The `public/_routes.json` file limits Function execution to API routes so normal
page visits use static hosting. Pages supplies the SPA fallback for React Router.
Missing email configuration returns a form error while the website stays available.

The Function rejects requests over 16 KB, validates fields, and only reports
success after Resend returns a message ID. Its five-attempts-per-ten-minutes IP
limit is best effort per isolate, not a global limit: counters reset on eviction
and separate isolates/locations have separate counters. No database is required.
Provider acceptance does not guarantee inbox delivery. Cloudflare's free Function
quota and Resend's email limits still apply.

References: [Pages routing](https://developers.cloudflare.com/pages/functions/routing/),
[runtime settings and secrets](https://developers.cloudflare.com/pages/functions/bindings/).

### Deploy as one Docker service

The root Dockerfile builds React and Go, then serves both from one container.
The browser uses the same origin for the website and API, with no CORS setup.

On [Render](https://render.com/docs/docker):

1. Create a Web Service connected to this repository.
2. Choose Docker, leave the root directory at the repository root, and use `./Dockerfile`.
3. Add the three email environment variables above in the service dashboard.
4. Set the health check path to `/healthz` and deploy.

The server listens on the host's `PORT`. The container defaults to port 8080.
`STATIC_DIR` points to the bundled website; `CONTACT_ADDR` optionally overrides
both the host and port. The container can also run on other Docker hosts:

```sh
docker build -t personal-website .
docker run --rm -p 8080:8080 --env-file backend/.env personal-website
```

For Docker's `--env-file`, use unquoted values, e.g.
`CONTACT_FROM_EMAIL=contact@your-verified-domain.com`.

### Limits and verification

The API accepts at most 16 KB per request and permits five valid submission
attempts per connection IP in ten minutes, including failed delivery attempts.
Invalid submissions do not consume that allowance. Limits live in memory and
reset on restart. Forwarding headers are deliberately ignored: behind a proxy,
visitors can share the proxy's allowance. Configure per-client limiting at a
trusted ingress if needed; multiple instances do not share limits.

```sh
cd backend
go test -race ./...
```

Tests use a fake email provider; they never send real email.
