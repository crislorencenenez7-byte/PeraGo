const BALANCE_KEY = "perago_balance";
const TRANSACTIONS_KEY = "perago_transactions";

export function getBalance() {
  const saved = localStorage.getItem(BALANCE_KEY);

  if (saved === null) {
    return 0;
  }

  return Number(saved);
}

export function setBalance(amount) {
  const value = Number(amount);

  if (!Number.isFinite(value) || value < 0) {
    throw new Error("Invalid balance.");
  }

  localStorage.setItem(BALANCE_KEY, value.toFixed(2));
}

export function getTransactions() {
  const saved = localStorage.getItem(TRANSACTIONS_KEY);

  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function addTransaction(transaction) {
  const transactions = getTransactions();

  transactions.unshift({
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    ...transaction
  });

  localStorage.setItem(
    TRANSACTIONS_KEY,
    JSON.stringify(transactions)
  );
}

export function formatPeso(amount) {
  return Number(amount).toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP"
  });
}
