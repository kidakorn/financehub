# Personal Finance Planner Module

This plan outlines the architecture and implementation steps for adding the new Personal Finance Planner module to DevaDrive.

## Proposed Changes

---

### Database Schema

#### [MODIFY] [schema.prisma](file:///d:/Coding/DEVAKORN/DriveDebt/prisma/schema.prisma)
Add the following models:
- `IncomeSource`: Links to `User`. Fields: `name`, `estimatedAmount`, `payday` (String "YYYY-MM-DD"), `shiftWeekend` (Boolean).
- `MonthlyIncome`: Tracks actuals for a specific month. Links to `IncomeSource`. Fields: `month` (String YYYY-MM), `actualAmount`, `isConfirmed`.
- `PlannedExpense`: Links to `User`. Fields: `name`, `category` (enum: fixed, one-time, savings), `amount`, `expectedDate` (String "YYYY-MM-DD"), `month` (String YYYY-MM).

---

### Backend Logic

#### [NEW] [financeActions.ts](file:///d:/Coding/DEVAKORN/DriveDebt/src/actions/financeActions.ts)
Server Actions to handle mutations:
- `getFinanceData(month)`: Fetches income, expenses, and automatically fetches DevaDrive car installments for the user to include as read-only expenses.
- `addIncomeSource(data)`
- `confirmMonthlyIncome(id, actualAmount)`
- `addPlannedExpense(data)`

#### [NEW] [financeUtils.ts](file:///d:/Coding/DEVAKORN/DriveDebt/src/lib/financeUtils.ts)
Utility functions:
- `calculateNextPayday(date, shiftWeekend)`: Shifts Saturday/Sunday paydays to Friday if configured.
- `generateTimeline(incomes, expenses)`: Merges incomes and expenses into a single chronological timeline for the month. **Flags any day where cumulative expenses before the next payday exceed the current confirmed income as "at risk".**

---

### UI Components

#### [NEW] [FinanceTab.tsx](file:///d:/Coding/DEVAKORN/DriveDebt/src/components/FinanceTab.tsx)
The main container for the Finance module. It will render:
- **Summary Header**: Total Income, Total Expenses (including car loans), Remaining Balance, Savings Target.
- **Income Section**: List of income sources with a button to "Confirm" this month's actual amount.
- **Expenses Section**: Categorized list of planned expenses (Fixed, One-time, Savings) + imported Car Loans.
- **Timeline View**: A chronological timeline visualizing cash flow and highlighting days where balance might go negative or is flagged as "at risk".

#### [NEW] [AddIncomeModal.tsx](file:///d:/Coding/DEVAKORN/DriveDebt/src/components/AddIncomeModal.tsx)
Form to add a new income source with a calendar date picker for the payday.

#### [NEW] [AddExpenseModal.tsx](file:///d:/Coding/DEVAKORN/DriveDebt/src/components/AddExpenseModal.tsx)
Form to add a planned expense with category selection and a calendar date picker.

#### [NEW] [FinanceDictionary.ts](file:///d:/Coding/DEVAKORN/DriveDebt/src/i18n/financeDict.ts)
A localized dictionary (TH/EN) specifically for the finance module to avoid touching the main `dictionary.ts`.

---

### Integration / Routing

#### [MODIFY] [DashboardClient.tsx](file:///d:/Coding/DEVAKORN/DriveDebt/src/components/DashboardClient.tsx)
- Add `'finance'` to the `TabID` type.
- Add the "Finance" tab to the Header navigation.
- Render `<FinanceTab />` when the active tab is `'finance'`.

## Verification Plan

### Automated Checks
- `npx prisma generate` and `npx prisma db push` to verify schema validity.
- `npm run build` to ensure type safety across the new feature.

### Manual Verification
1. Add an income source falling on a weekend to verify the "shift to Friday" logic.
2. Add a car loan in DevaDrive, then open the Finance tab to verify it appears in the expenses list automatically.
3. Verify the timeline correctly identifies an "at risk" negative cash flow day if a large expense occurs before a confirmed payday.
