# AutoPiac

A bilingual used-car marketplace MVP built with Next.js, Prisma, SQLite, and local image uploads.

## Run Locally

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Accounts

- Seller: `seller@autopiac.test`
- Buyer: `buyer@autopiac.test`
- Seller password: `Lionessey`
- Buyer password: `autopiac123`

## Useful Commands

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Uploaded listing photos are stored in `uploads/` and served through `/media/[file]`. The local SQLite database is stored at `prisma/dev.db`.
