const style = document.createElement("style");
style.textContent = `
#perago-update-timer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99999;
  padding: 10px 16px;
  background: #111;
  color: #fff;
  text-align: center;
  font: 600 14px Arial, sans-serif;
  box-shadow: 0 2px 10px rgba(0,0,0,.25);
}
#perago-update-timer strong {
  color: #ffd700;
}
`;
document.head.appendChild(style);

const timer = document.createElement("div");
timer.id = "perago-update-timer";
timer.textContent = "Loading PeraGo update schedule...";
document.body.prepend(timer);

async function loadSchedule() {
  try {
    const response = await fetch("/update-schedule.json?ts=" + Date.now(), {
      cache: "no-store"
    });

    if (!response.ok) throw new Error("Schedule unavailable");

    const data = await response.json();
    const update = data.update;

    const target = new Date(
      `${update.date}T${update.time}:00+08:00`
    ).getTime();

    function updateTimer() {
      const remaining = target - Date.now();

      if (remaining <= 0) {
        timer.innerHTML = "🚀 <strong>PeraGo update is now being promoted!</strong>";
        return;
      }

      const totalSeconds = Math.floor(remaining / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      timer.innerHTML =
        `🚀 Next PeraGo Update: <strong>` +
        `${days}d ${String(hours).padStart(2, "0")}:` +
        `${String(minutes).padStart(2, "0")}:` +
        `${String(seconds).padStart(2, "0")}</strong>`;
    }

    updateTimer();
    setInterval(updateTimer, 1000);
  } catch (error) {
    console.error("Update timer error:", error);
    timer.textContent = "PeraGo update schedule unavailable.";
  }
}

loadSchedule();
