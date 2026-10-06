import { getTransactions, formatPeso } from "./wallet.js";

const txContainer = document.getElementById("transactions");

function renderTransactions() {
  const transactions = getTransactions();

  if (!txContainer) return;

  if (transactions.length === 0) {
    txContainer.innerHTML = `
      <div class="transaction">
        <div class="tx-main">
          <div class="tx-title">No transactions yet</div>
          <div class="tx-sub">Your wallet activity will appear here.</div>
        </div>
      </div>
    `;
    return;
  }

  txContainer.innerHTML = transactions.slice(0, 5).map(tx => {
    const isIncoming = tx.direction === "in";
    const amount = formatPeso(tx.amount);
    const date = new Date(tx.date).toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    let icon = isIncoming ? "↓" : "➤";
    let cls = isIncoming ? "green" : "blue";
    let type = isIncoming ? "plus" : "minus";
    let title = tx.title || (isIncoming ? "Received Money" : "Sent Money");

    let sub = "";

    if (tx.type === "cash_in") {
    } else if (tx.type === "send") {
      sub = "To " + (tx.recipient || "Recipient");
    } else {
      sub = "PeraGo Wallet";
    }

    return `
      <div class="transaction">
        <div class="tx-icon action-icon ${cls}">${icon}</div>

        <div class="tx-main">
          <div class="tx-title">${title}</div>
          <div class="tx-sub">${sub}</div>
          <div class="tx-date">${date}</div>
        </div>

        <div class="tx-amount ${type}">
          ${isIncoming ? "+" : "-"} ${amount}
        </div>
      </div>
    `;
  }).join("");
}

renderTransactions();

function toast(message) {
  const el = document.getElementById("toast");

  if (!el) return;

  el.textContent = message;
  el.classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {
    el.classList.remove("show");
  }, 1800);
}

document.querySelectorAll(".nav-item").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-item")
      .forEach(x => x.classList.remove("active"));

    btn.classList.add("active");

    if (!btn.getAttribute("onclick")) {
      toast(`${btn.dataset.page} page — coming next`);
    }
  });
});

document.getElementById("seeAll")?.addEventListener("click", () => {
  toast("Full transaction history — coming next");
});

document.getElementById("learnMore")?.addEventListener("click", () => {
  toast("QR payments — coming next");
});

document.getElementById("historyAction")?.addEventListener("click", () => {
  document.getElementById("transactions")?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});

document.querySelector('.nav-item[data-page="Transactions"]')?.addEventListener("click", () => {
  document.getElementById("transactions")?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});
