# DevaDrive Project Overview

DevaDrive (DriveDebt) is a beautifully designed, full-stack application built to track and manage vehicle loans. It solves a common problem for vehicle owners: tracking how much of their car or motorcycle loan is paid off, how many installments remain, and exactly how much is due each month.

## 1. Key Features
* **Bilingual Support:** Fully togglable between English and Thai (`TH` / `EN`).
* **Visual Progress Tracking:** Users can click on a vehicle to open a detailed slide-out panel (`BillingView`) that renders interactive payment charts using the `Recharts` library.
* **Interactive Installments:** Users can click individual monthly installments to toggle them as "Paid," which dynamically updates their progress bar and remaining balance.

---

## 2. The Tech Stack
DevaDrive uses a very modern, bleeding-edge web development stack:

* **Framework:** **Next.js 16** (App Router). It leverages React Server Components (RSC) and Server Actions to handle data fetching and mutations without needing standard REST APIs.
* **Database:** **Neon (Serverless Postgres)**. Because standard Postgres connections can exhaust limits in serverless environments, Neon uses a connection pooler, making it lightning-fast and perfectly suited for Vercel/Next.js.
* **ORM:** **Prisma** (v7) equipped with the `@prisma/adapter-neon` to bridge Prisma queries directly to Neon's serverless driver.
* **Styling & UI:** **Tailwind CSS** combined with **shadcn/ui**. This gives it the premium, clean, "glassmorphism" aesthetic with minimal CSS bloat.
* **Authentication:** A custom, stateless **JWT (JSON Web Token)** implementation using the `jose` library and `bcryptjs` for password hashing. Sessions are stored in secure, HTTP-only cookies.

---

## 3. Project Structure
The repository strictly follows the Next.js App Router architecture:

* **`src/app/`**: Contains the routing logic.
  * `page.tsx`: The main protected dashboard.
  * `(auth)/login` & `(auth)/register`: The public authentication pages.
* **`src/actions/`**: Next.js Server Actions.
  * `auth.ts`: Handles login/signup logic securely on the server.
  * `carActions.ts`: Handles the database CRUD operations (Create, Read, Update, Delete) for vehicles and toggling the payment status of installments.
* **`src/components/`**: Reusable React components (`Header`, `AddCarModal`, `BillingView`, `ConfirmDialog`, and various UI elements).
* **`src/lib/`**: Core business logic and utilities.
  * `calculateLoan.ts`: The financial math engine.
  * `session.ts`: JWT encryption/decryption.
  * `db.ts`: The Prisma client singleton.
* **`prisma/`**: Contains the `schema.prisma` file, which defines the `User`, `Car`, and `Installment` database tables.

---

## 4. The Core Loan Calculation Engine
The heart of DevaDrive's logic lives inside `src/lib/calculateLoan.ts`. When a user adds a new vehicle, the app doesn't just save it; it calculates the exact financial breakdown for the entire lifespan of the loan.

Here is the exact math the app runs when building a loan profile:

**1. Calculate the Principal:**
```javascript
const principal = price - downPayment;
```
*(The total amount actually being financed).*

**2. Calculate Total Interest (Flat Rate):**
```javascript
const years = termMonths / 12;
const totalInterest = principal * (annualRate / 100) * years;
```
*(Unlike compound interest used in mortgages, auto loans often use a flat rate applied to the original principal across the total years).*

**3. Calculate the Monthly Payment:**
```javascript
const monthlyExcVAT = (principal + totalInterest) / termMonths;
```

**4. Apply Taxes and Add-ons (VAT & PPI):**
```javascript
// Adds 7% VAT if the user checked "Include VAT"
const monthlyIncVAT = input.includeVat ? monthlyExcVAT * 1.07 : monthlyExcVAT;

// Adds PPI (Payment Protection Insurance) if applicable
const monthlyAmt = monthlyIncVAT + ppi;
```

**5. Generate the Schedule:**
Once the exact `monthlyAmt` is calculated, the system loops through the `termMonths` (e.g., 60 months) and generates an array of individual `Installment` records. Each installment is given a due date, starting from the user's selected `startDate` and incrementing by exactly one month.

These generated installments are then pushed directly into the Neon database linked to that specific car!
