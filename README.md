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

## Contact backend

Requires Go 1.25+. Run the API in a separate terminal alongside `npm run dev`:

```sh
cd backend
go run .
```

Vite proxies `/api/contact` to `127.0.0.1:8080`. The endpoint accepts POST JSON
with `name`, `email`, and `message`. It returns field errors with HTTP 422,
and HTTP 429 with a `Retry-After` header after five successful submissions per IP
in ten minutes. Invalid submissions do not count. Limits are in memory and reset on restart.
Successful requests only validate the form; messages are not stored or emailed.

The backend uses the connection's IP and ignores spoofable forwarding headers.
Through the development proxy, all requests share the proxy's IP. In production,
route `/api/contact` to the Go service on the same website origin and configure
per-client IP limiting at your trusted ingress proxy; otherwise the backend will
limit all visitors sharing that proxy together. Multiple Go instances do not share
their in-memory limits. `CONTACT_ADDR` overrides the API's listening address.
The Vite development proxy is not part of the production build or preview server.

Run backend checks with `cd backend && go test -race ./...`.
