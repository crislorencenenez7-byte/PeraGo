const transactions = [
  { icon: "↓", title: "Received Money", sub: "From Juan Dela Cruz", date: "Oct 1, 2026 • 08:45 AM", amount: "+ ₱500.00", type: "plus", cls: "green" },
  { icon: "➤", title: "Sent Money", sub: "To Ana Santos", date: "Sep 30, 2026 • 04:12 PM", amount: "- ₱200.00", type: "minus", cls: "blue" },
  { icon: "▦", title: "Cash In", sub: "Via Bank Transfer", date: "Sep 29, 2026 • 11:27 AM", amount: "+ ₱1,000.00", type: "plus", cls: "purple" },
  { icon: "▣", title: "Payment", sub: "Online Purchase", date: "Sep 28, 2026 • 07:53 PM", amount: "- ₱300.00", type: "minus", cls: "orange" }
];

const txContainer = document.getElementById("transactions");
txContainer.innerHTML = transactions.map(tx => `
  <div class="transaction">
    <div class="tx-icon action-icon ${tx.cls}">${tx.icon}</div>
    <div class="tx-main">
      <div class="tx-title">${tx.title}</div>
      <div class="tx-sub">${tx.sub}</div>
      <div class="tx-date">${tx.date}</div>
    </div>
    <div class="tx-amount ${tx.type}">${tx.amount}</div>
  </div>
`).join("");

function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => el.classList.remove("show"), 1800);
}

document.querySelectorAll(".action").forEach(btn => {
  btn.addEventListener("click", () => toast(`${btn.dataset.action} — coming next`));
});

document.querySelectorAll(".nav-item").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    toast(`${btn.dataset.page} page — coming next`);
  });
});

document.getElementById("seeAll").addEventListener("click", () => toast("Transaction history — coming next"));
document.getElementById("learnMore").addEventListener("click", () => toast("QR payments — coming next"));

let hidden = false;
document.getElementById("toggleBalance").addEventListener("click", (e) => {
  hidden = !hidden;
  document.getElementById("balance").textContent = hidden ? "₱ ••••" : "₱0.00";
  e.currentTarget.textContent = hidden ? "◉ Show Balance" : "◉ View Balance";
});
