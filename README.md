# DevaDrive (Fleet & Debt Management)

DevaDrive is a professional, bilingual (English/Thai) web application designed to help individuals and businesses manage their vehicle fleets and track auto loan debts.

## 🚀 Features
- **Vehicle Tracking**: Add and manage both cars and motorcycles in your fleet.
- **Advanced Loan Calculation**: Automatically calculates complex amortization schedules, including down payments, Payment Protection Insurance (PPI), interest rates, and VAT calculations specific to Thai auto leasing.
- **Installment Management**: Track exactly what is paid and what is pending on a month-to-month basis across all vehicles.
- **Visual Dashboard**: View total debt, monthly outflows, and interactive charts visualizing your payment schedules over time.
- **Secure Authentication**: Built with NextAuth.js for secure Google OAuth login.
- **Bilingual Interface**: Seamlessly switch between English and Thai languages.

## 🛠 Tech Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Base-UI
- **Database**: Neon (Serverless Postgres)
- **ORM**: Prisma (v7 + Neon Adapter)
- **Authentication**: Stateless Custom JWT (`jose`) + `bcryptjs`
- **Deployment**: Vercel

## 💻 Getting Started Locally

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your `.env.local` file with your Database and Auth keys.
4. Generate the Prisma client: `npx prisma generate`
5. Push the database schema: `npx prisma db push`
6. Run the development server: `npm run dev`
