/** ─── DevaDrive Core Type Definitions ─────────────────────────────────────── */

/** Supported UI languages */
export type Lang = 'th' | 'en';

/** A single monthly installment record */
export interface Installment {
  id:      string;   // `${carId}-${no}`
  no:      number;   // 1-based installment number
  dueDate: string;   // YYYY-MM-DD
  amount:  number;   // Monthly payment incl. 7% VAT (THB)
  isPaid:  boolean;  // Payment status
}

/** A financed car entity */
export interface Car {
  id:           string;        // UUID
  vehicleType:  'car' | 'motorcycle';
  name:         string;        // Car name/model
  price:        number;        // Full car price (THB)
  downPayment:  number;        // Down payment (THB)
  principal:    number;        // price - downPayment
  annualRate:   number;        // Interest rate % per year
  termMonths:   number;        // Loan term in months
  startDate:    string;        // YYYY-MM-DD — first payment reference
  monthlyAmt:   number;        // Monthly payment incl. VAT
  totalInterest:number;        // Total interest (exc. VAT)
  totalWithVAT: number;        // Total repayment incl. VAT
  createdAt:    string;        // ISO timestamp
  schedule:     Installment[]; // Full payment schedule
}

/** Form input values for adding a car */
export interface CarFormInput {
  vehicleType: 'car' | 'motorcycle';
  name:        string;
  price:       string;
  downPayment: string;
  annualRate:  string;
  termMonths:  string;
  startDate:   string;
}

/** Computed stats for a car (derived, not stored) */
export interface CarStats {
  paidCount:      number;
  remainingCount: number;
  progressPct:    number;
  totalPaid:      number;
  remaining:      number;
}

/** Global app state */
export interface AppState {
  cars:   Car[];
  lang:   Lang;
}

/** All reducer actions */
export type AppAction =
  | { type: 'ADD_CAR';     payload: Car }
  | { type: 'DELETE_CAR';  carId: string }
  | { type: 'TOGGLE_PAID'; carId: string; installmentId: string }
  | { type: 'SET_LANG';    lang: Lang }
  | { type: 'HYDRATE_STATE'; payload: AppState };

/** Full i18n dictionary shape */
export interface Dictionary {
  // App
  appName:            string;
  appSubtitle:        string;
  brandTag:           string;

  // Dashboard
  dashboardTitle:     string;
  dashboardDesc:      string;
  noCarsTitle:        string;
  noCarsDesc:         string;
  addFirstCar:        string;
  btnAddCar:          string;
  btnViewBilling:     string;
  btnDeleteCar:       string;
  confirmDelete:      string;

  // Car card stats
  statMonthly:        string;
  statProgress:       string;
  statPaid:           string;
  statRemaining:      string;
  statTotalPaid:      string;
  statRemainingAmt:   string;
  unitInstallments:   string;

  // Add car modal
  modalTitleAdd:      string;
  modalTitleEdit:     string;
  labelCarName:       string;
  placeholderCarName: string;
  labelPrice:         string;
  labelDown:          string;
  labelRate:          string;
  labelTerm:          string;
  labelStartDate:     string;
  labelTermPresets:   string;
  unitMonths:         string;
  btnSave:            string;
  btnCancel:          string;
  errorInvalid:       string;

  // Billing view
  billingTitle:       string;
  billingSubtitle:    string;
  btnBack:            string;
  colNo:              string;
  colDueDate:         string;
  colAmount:          string;
  colStatus:          string;
  colMark:            string;
  badgePaid:          string;
  badgePending:       string;
  filterAll:          string;
  filterPaid:         string;
  filterPending:      string;
  tableProgress:      string;
  emptyFilter:        string;
  paginationInfo:     string;
  btnPrev:            string;
  btnNext:            string;

  // Summary labels
  summaryPrincipal:   string;
  summaryInterest:    string;
  summaryTotalVAT:    string;
  summaryMonthly:     string;
  summaryPreVAT:      string;
  summaryInclVAT:     string;
  summaryRate:        string;
  summaryTerm:        string;

  // Footer
  footerCopy:         string;
  footerNote:         string;
}
