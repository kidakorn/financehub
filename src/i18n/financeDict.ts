export interface FinanceDictionary {
  tabFinance: string;
  navPlanner: string;
  navCalendar: string;
  navAnalytics: string;
  btnEdit: string;
  confirmDelete: string;
  btnDeleteCar: string;
  summaryTitle: string;
  totalIncome: string;
  totalExpenses: string;
  remainingBalance: string;
  incomeSources: string;
  plannedExpenses: string;
  timeline: string;
  btnAddIncome: string;
  btnAddExpense: string;
  btnConfirm: string;
  lblEstimated: string;
  lblConfirmed: string;
  atRiskWarning: string;
  expenseCategoryFixed: string;
  expenseCategoryOneTime: string;
  expenseCategorySavings: string;
  carLoanImport: string;
  noData: string;
  modalAddIncomeTitle: string;
  modalAddExpenseTitle: string;
  lblIncomeName: string;
  lblAmount: string;
  lblPayday: string;
  lblShiftWeekend: string;
  lblExpenseName: string;
  lblCategory: string;
  lblExpectedDate: string;
  lblEndMonth: string;
  lblEndMonthDesc: string;
  btnSave: string;
  btnCancel: string;
  sortExpectedAsc: string;
  sortExpectedDesc: string;
  sortCreatedDesc: string;
}

export const financeDictEn: FinanceDictionary = {
  tabFinance: 'Personal Budget',
  navPlanner: 'Planner',
  navCalendar: 'Calendar',
  navAnalytics: 'Analytics',
  btnEdit: 'Edit',
  confirmDelete: 'Are you sure?',
  btnDeleteCar: 'Delete',
  summaryTitle: 'Monthly Overview',
  totalIncome: 'Total Income',
  totalExpenses: 'Committed Expenses',
  remainingBalance: 'Remaining Spendable',
  incomeSources: 'Income Sources',
  plannedExpenses: 'Planned Expenses',
  timeline: 'Cash Flow Timeline',
  btnAddIncome: 'Add Income Source',
  btnAddExpense: 'Add Planned Expense',
  btnConfirm: 'Confirm',
  lblEstimated: 'Estimated',
  lblConfirmed: 'Confirmed',
  atRiskWarning: 'Negative Balance Risk',
  expenseCategoryFixed: 'Fixed Bill',
  expenseCategoryOneTime: 'One-time',
  expenseCategorySavings: 'Savings Goal',
  carLoanImport: 'Auto-imported from Fleet Manager',
  noData: 'No data yet.',
  modalAddIncomeTitle: 'New Income Source',
  modalAddExpenseTitle: 'New Planned Expense',
  lblIncomeName: 'Income Source Name',
  lblAmount: 'Amount',
  lblPayday: 'Expected Payday',
  lblShiftWeekend: 'Shift weekend paydays to Friday',
  lblExpenseName: 'Expense Name',
  lblCategory: 'Category',
  lblExpectedDate: 'Expected Date',
  lblEndMonth: 'Installment End Month',
  lblEndMonthDesc: 'Optional. Leave empty if not an installment.',
  btnSave: 'Save',
  btnCancel: 'Cancel',
  sortExpectedAsc: 'Date (Old - New)',
  sortExpectedDesc: 'Date (New - Old)',
  sortCreatedDesc: 'Recently Added',
};

export const financeDictTh: FinanceDictionary = {
  tabFinance: 'งบประมาณส่วนบุคคล',
  navPlanner: 'วางแผน',
  navCalendar: 'ปฏิทิน',
  navAnalytics: 'สถิติ',
  btnEdit: 'แก้ไข',
  confirmDelete: 'ยืนยันการลบ?',
  btnDeleteCar: 'ลบ',
  summaryTitle: 'ภาพรวมรายเดือน',
  totalIncome: 'รายได้รวม',
  totalExpenses: 'รายจ่ายประจำ',
  remainingBalance: 'เงินคงเหลือที่ใช้ได้',
  incomeSources: 'แหล่งรายได้',
  plannedExpenses: 'รายจ่ายที่วางแผนไว้',
  timeline: 'ไทม์ไลน์กระแสเงินสด',
  btnAddIncome: 'เพิ่มแหล่งรายได้',
  btnAddExpense: 'เพิ่มรายจ่ายที่วางแผนไว้',
  btnConfirm: 'ยืนยันยอด',
  lblEstimated: 'ประมาณการ',
  lblConfirmed: 'ยืนยันแล้ว',
  atRiskWarning: 'ความเสี่ยงเงินสดติดลบ',
  expenseCategoryFixed: 'ค่าใช้จ่ายคงที่',
  expenseCategoryOneTime: 'จ่ายครั้งเดียว',
  expenseCategorySavings: 'เป้าหมายออมเงิน',
  carLoanImport: 'นำเข้าอัตโนมัติจาก Fleet Manager',
  noData: 'ยังไม่มีข้อมูล',
  modalAddIncomeTitle: 'แหล่งรายได้ใหม่',
  modalAddExpenseTitle: 'เพิ่มรายจ่ายที่วางแผนไว้',
  lblIncomeName: 'ชื่อแหล่งรายได้',
  lblAmount: 'จำนวนเงิน',
  lblPayday: 'วันที่คาดว่าจะได้รับ',
  lblShiftWeekend: 'เลื่อนวันหยุดเป็นวันศุกร์',
  lblExpenseName: 'ชื่อรายการ',
  lblCategory: 'หมวดหมู่',
  lblExpectedDate: 'วันที่คาดว่าจะจ่าย',
  lblEndMonth: 'เดือนที่สิ้นสุดผ่อนชำระ',
  lblEndMonthDesc: 'เลือกได้ เว้นว่างไว้หากไม่ใช่รายการผ่อนชำระ',
  btnSave: 'บันทึก',
  btnCancel: 'ยกเลิก',
  sortExpectedAsc: 'วันที่ (เก่า-ใหม่)',
  sortExpectedDesc: 'วันที่ (ใหม่-เก่า)',
  sortCreatedDesc: 'เพิ่มล่าสุด',
};
