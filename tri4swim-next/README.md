# Tri4Swim v7
Next.js + PostgreSQL + Prisma. Public Home + live availability Booking + Admin Calendar.

## Local
1. Copy `.env.example` to `.env` and set `DATABASE_URL`.
2. `npm install`
3. `npm run dev`

Startup checks/creates the requested database when the PostgreSQL account has permission, runs `prisma db push` without reset (existing tables/data are preserved; missing schema is added), then seeds only missing defaults.

## Admin
`/admin` includes weekly calendar, pending booking confirmation, booking cancellation and blocked-time creation. Confirming a website request moves it onto the coach calendar and sends confirmation email when SMTP is configured.

## Docker
The compose file runs only the Next.js app; PostgreSQL is external/existing. When PostgreSQL is on the Docker host use `host.docker.internal` in `DATABASE_URL` on Mac/Windows.

## Environment loading
Local startup scripts explicitly load `.env` and then `.env.local` before reading `DATABASE_URL`. This keeps `yarn dev` and `npm run dev` consistent with Next.js. In Docker, Compose/host-provided environment variables remain supported; `.env` is not required inside the image when `DATABASE_URL` is supplied by the container environment.


## v8.2 image update
Default homepage images were replaced with the newly generated TRI4SWIM-branded image set. The three lesson images are stored as separate files; image URLs remain editable through the existing database/admin fields.

## v8.4 Admin authentication + responsive admin
- `/admin` now requires a login session.
- Configure `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` in `.env`.
- Default development password in the bundled `.env`: `tri4swim-admin` (change before production).
- Admin dashboard, weekly calendar, booking confirmation/cancellation, blocked time, and manual appointment creation are responsive on desktop and mobile.
- Mobile admin uses a bottom navigation bar and stacked day calendar.


## v8.6
Admin now has SVG menu icons, editable website content, separate booking requests, recurring Courses with Start/End custom calendars and weekly day/time schedules. Creating a course generates its lesson occurrences for the coach calendar. Admin remains responsive with mobile bottom navigation.


## v8.7 admin polish
- Add Course uses the same custom calendar as customer booking for Start/End dates.
- Lesson/day/time controls are custom dropdowns; no browser select/time UI in Add Course.
- Mobile recurring rows always show both From and To time.
- Website editor is split into Hero, Benefits, Lessons, Coach, Booking & CTA, and Contact tabs.
- Bundled lesson image defaults are repaired by lesson name without overwriting custom external image URLs.
- Website booking request sends an acknowledgement to the customer and a notification to ADMIN_EMAIL when SMTP is configured.

## v8.8
Admin Courses now supports editing course details, recurring date range, lesson type, weekly day/time rows, notes, and active status. Saving regenerates the course appointment occurrences from the edited recurring schedule.

## Clean base dependency update (2026-09-24)
- Next.js pinned to 15.5.26 (current patched Maintenance LTS release as of 2026-09-24).
- Prisma and @prisma/client remain pinned to 6.19.0.
- Email uses Nodemailer/SMTP only. AWS SES SDK is intentionally not a dependency.
- No yarn.lock, package-lock.json, node_modules, or .next cache is shipped in this archive.

## Persistent Admin image uploads
Admin Website/Lesson image uploads are stored in `UPLOAD_DIR` (default `/app/uploads`). Docker Compose mounts host `./uploads` to `/app/uploads`, so uploaded files survive container rebuilds and can be backed up or linked externally. Public image URLs are served as `/uploads/<generated-file>` by the app. Do not delete the host `uploads` folder during deployment.
