[1mdiff --git a/script.js b/script.js[m
[1mindex 6dd858c..fa3ba6a 100644[m
[1m--- a/script.js[m
[1m+++ b/script.js[m
[36m@@ -1,49 +1,114 @@[m
[31m-const transactions = [[m
[31m-  { icon: "↓", title: "Received Money", sub: "From Juan Dela Cruz", date: "Oct 1, 2026 • 08:45 AM", amount: "+ ₱500.00", type: "plus", cls: "green" },[m
[31m-  { icon: "➤", title: "Sent Money", sub: "To Ana Santos", date: "Sep 30, 2026 • 04:12 PM", amount: "- ₱200.00", type: "minus", cls: "blue" },[m
[31m-  { icon: "▦", title: "Cash In", sub: "Via Bank Transfer", date: "Sep 29, 2026 • 11:27 AM", amount: "+ ₱1,000.00", type: "plus", cls: "purple" },[m
[31m-  { icon: "▣", title: "Payment", sub: "Online Purchase", date: "Sep 28, 2026 • 07:53 PM", amount: "- ₱300.00", type: "minus", cls: "orange" }[m
[31m-];[m
[32m+[m[32mimport { getTransactions, formatPeso } from "./wallet.js";[m
 [m
 const txContainer = document.getElementById("transactions");[m
[31m-txContainer.innerHTML = transactions.map(tx => `[m
[31m-  <div class="transaction">[m
[31m-    <div class="tx-icon action-icon ${tx.cls}">${tx.icon}</div>[m
[31m-    <div class="tx-main">[m
[31m-      <div class="tx-title">${tx.title}</div>[m
[31m-      <div class="tx-sub">${tx.sub}</div>[m
[31m-      <div class="tx-date">${tx.date}</div>[m
[31m-    </div>[m
[31m-    <div class="tx-amount ${tx.type}">${tx.amount}</div>[m
[31m-  </div>[m
[31m-`).join("");[m
[32m+[m
[32m+[m[32mfunction renderTransactions() {[m
[32m+[m[32m  const transactions = getTransactions();[m
[32m+[m
[32m+[m[32m  if (!txContainer) return;[m
[32m+[m
[32m+[m[32m  if (transactions.length === 0) {[m
[32m+[m[32m    txContainer.innerHTML = `[m
[32m+[m[32m      <div class="transaction">[m
[32m+[m[32m        <div class="tx-main">[m
[32m+[m[32m          <div class="tx-title">No transactions yet</div>[m
[32m+[m[32m          <div class="tx-sub">Your wallet activity will appear here.</div>[m
[32m+[m[32m        </div>[m
[32m+[m[32m      </div>[m
[32m+[m[32m    `;[m
[32m+[m[32m    return;[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  txContainer.innerHTML = transactions.slice(0, 5).map(tx => {[m
[32m+[m[32m    const isIncoming = tx.direction === "in";[m
[32m+[m[32m    const amount = formatPeso(tx.amount);[m
[32m+[m[32m    const date = new Date(tx.date).toLocaleString("en-PH", {[m
[32m+[m[32m      month: "short",[m
[32m+[m[32m      day: "numeric",[m
[32m+[m[32m      year: "numeric",[m
[32m+[m[32m      hour: "2-digit",[m
[32m+[m[32m      minute: "2-digit"[m
[32m+[m[32m    });[m
[32m+[m
[32m+[m[32m    let icon = isIncoming ? "↓" : "➤";[m
[32m+[m[32m    let cls = isIncoming ? "green" : "blue";[m
[32m+[m[32m    let type = isIncoming ? "plus" : "minus";[m
[32m+[m[32m    let title = tx.title || (isIncoming ? "Received Money" : "Sent Money");[m
[32m+[m
[32m+[m[32m    let sub = "";[m
[32m+[m
[32m+[m[32m    if (tx.type === "cash_in") {[m
[32m+[m[32m      sub = "Demo Cash In";[m
[32m+[m[32m    } else if (tx.type === "send") {[m
[32m+[m[32m      sub = "To " + (tx.recipient || "Recipient");[m
[32m+[m[32m    } else {[m
[32m+[m[32m      sub = "PeraGo Wallet";[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    return `[m
[32m+[m[32m      <div class="transaction">[m
[32m+[m[32m        <div class="tx-icon action-icon ${cls}">${icon}</div>[m
[32m+[m
[32m+[m[32m        <div class="tx-main">[m
[32m+[m[32m          <div class="tx-title">${title}</div>[m
[32m+[m[32m          <div class="tx-sub">${sub}</div>[m
[32m+[m[32m          <div class="tx-date">${date}</div>[m
[32m+[m[32m        </div>[m
[32m+[m
[32m+[m[32m        <div class="tx-amount ${type}">[m
[32m+[m[32m          ${isIncoming ? "+" : "-"} ${amount}[m
[32m+[m[32m        </div>[m
[32m+[m[32m      </div>[m
[32m+[m[32m    `;[m
[32m+[m[32m  }).join("");[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32mrenderTransactions();[m
 [m
 function toast(message) {[m
   const el = document.getElementById("toast");[m
[32m+[m
[32m+[m[32m  if (!el) return;[m
[32m+[m
   el.textContent = message;[m
   el.classList.add("show");[m
[32m+[m
   clearTimeout(window.toastTimer);[m
[31m-  window.toastTimer = setTimeout(() => el.classList.remove("show"), 1800);[m
[31m-}[m
 [m
[31m-document.querySelectorAll(".action").forEach(btn => {[m
[31m-  btn.addEventListener("click", () => toast(`${btn.dataset.action} — coming next`));[m
[31m-});[m
[32m+[m[32m  window.toastTimer = setTimeout(() => {[m
[32m+[m[32m    el.classList.remove("show");[m
[32m+[m[32m  }, 1800);[m
[32m+[m[32m}[m
 [m
 document.querySelectorAll(".nav-item").forEach(btn => {[m
   btn.addEventListener("click", () => {[m
[31m-    document.querySelectorAll(".nav-item").forEach(x => x.classList.remove("active"));[m
[32m+[m[32m    document.querySelectorAll(".nav-item")[m
[32m+[m[32m      .forEach(x => x.classList.remove("active"));[m
[32m+[m
     btn.classList.add("active");[m
[31m-    toast(`${btn.dataset.page} page — coming next`);[m
[32m+[m
[32m+[m[32m    if (!btn.getAttribute("onclick")) {[m
[32m+[m[32m      toast(`${btn.dataset.page} page — coming next`);[m
[32m+[m[32m    }[m
   });[m
 });[m
 [m
[31m-document.getElementById("seeAll").addEventListener("click", () => toast("Transaction history — coming next"));[m
[31m-document.getElementById("learnMore").addEventListener("click", () => toast("QR payments — coming next"));[m
[32m+[m[32mdocument.getElementById("seeAll")?.addEventListener("click", () => {[m
[32m+[m[32m  toast("Full transaction history — coming next");[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mdocument.getElementById("learnMore")?.addEventListener("click", () => {[m
[32m+[m[32m  toast("QR payments — coming next");[m
[32m+[m[32m});[m
 [m
 let hidden = false;[m
[31m-document.getElementById("toggleBalance").addEventListener("click", (e) => {[m
[32m+[m
[32m+[m[32mdocument.getElementById("toggleBalance")?.addEventListener("click", (e) => {[m
   hidden = !hidden;[m
[31m-  document.getElementById("balance").textContent = hidden ? "₱ ••••" : "₱0.00";[m
[31m-  e.currentTarget.textContent = hidden ? "◉ Show Balance" : "◉ View Balance";[m
[32m+[m
[32m+[m[32m  document.getElementById("balance").textContent =[m
[32m+[m[32m    hidden ? "₱ ••••" : "₱0.00";[m
[32m+[m
[32m+[m[32m  e.currentTarget.textContent =[m
[32m+[m[32m    hidden ? "◉ Show Balance" : "◉ View Balance";[m
 });[m
