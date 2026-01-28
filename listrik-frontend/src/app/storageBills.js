const KEY = "lp_bills_v1";

export function getBills() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function saveBills(bills) {
  localStorage.setItem(KEY, JSON.stringify(bills));
}

export function addBill(bill) {
  const bills = getBills();
  bills.unshift(bill);
  saveBills(bills);
}

export function deleteBill(id) {
  const bills = getBills().filter((b) => b.id !== id);
  saveBills(bills);
}

export function updateBill(id, patch) {
  const bills = getBills().map((b) => (b.id === id ? { ...b, ...patch } : b));
  saveBills(bills);
}
