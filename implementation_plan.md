# Platform Restructuring Plan: The Financial Hub

This plan outlines how to architecturally transform the application from a "vehicle tracking app with a finance tab" into a **unified Financial Planning Platform** containing two distinct, equal-tier modules.

## Proposed Architecture: Two-Tier Navigation

Instead of having 5 flat tabs (Dashboard, Payments, Fleet, Reports, Finance) all competing for space, we will introduce a **Two-Tier Navigation System**.

### Level 1: The Main Module Switcher (Top Header)
We will redesign the top-left of the header or add a primary segmented control in the center to toggle between the two massive pillars of the application:
1. **Module A (Formerly DevaDrive)**: Dedicated entirely to Auto Loans & Fleet tracking.
2. **Module B (Formerly Finance)**: Dedicated entirely to Personal Income & Expense planning.

### Level 2: The Sub-Navigation (Secondary Bar)
Depending on which Level 1 module is active, the sub-navigation will change:
- **If Module A is active**, the sub-tabs will be: `Dashboard` | `Payments` | `Fleet` | `Reports`
- **If Module B is active**, the sub-navigation can be empty (since everything currently fits on one screen), or we can break it out into `Overview` | `Income` | `Expenses`.

---

## Open Questions for You

Before I write the code to restructure the UI, I need your input on naming to ensure the branding is perfect:

> [!IMPORTANT]
> 1. **Overall Platform Name:** If "DevaDrive" is going to become just a sub-module, what do you want to call the entire website now? (e.g., "Devakorn Wealth", "DevaFinance", "MyFinancialHub")
> 2. **Module A Name:** What do you want to rename the "DaveDrive / Fleet Management" section to? (e.g., "Auto Loans", "Vehicle Finance", "DriveDebt")
> 3. **Module B Name:** What do you want to rename the "Finance" section to? (e.g., "Personal Budget", "Cash Flow", "Finance Planner")

---

## Technical Implementation Steps

Once you provide the names, I will execute the following:

### 1. Update State Management
- Modify `DashboardClient.tsx` state to track `activeModule: 'auto' | 'finance'`.
- Move the `activeTab` state to represent only the sub-tabs of the auto module (`'dashboard' | 'payments' | 'fleet' | 'reports'`).

### 2. Redesign the Header
- Modify `src/components/DashboardClient.tsx`'s `<Header />` component.
- Add a visual module switcher (like a sleek pill toggle or a dropdown if on mobile).
- Render a secondary tab bar directly underneath the header (or integrated cleanly) that displays the sub-tabs based on the selected module.

### 3. Update Dictionaries
- Update `src/i18n/dictionary.ts` and `src/i18n/financeDict.ts` with the new branding names you choose.

### 4. Layout Persistence
- Ensure that switching between the two main modules feels seamless without losing the sub-tab states.
