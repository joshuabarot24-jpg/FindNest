// Allowed report times: 6:00 AM to 7:00 PM in 30-minute steps, never in the future (Manila time)
export function timeLabels(date: string): string[] {
  const now = new Date();
  const m = new Date(now.getTime() + 8 * 60 * 60000 + now.getTimezoneOffset() * 60000);
  const pad = (n: number) => String(n).padStart(2, "0");
  const today = `${m.getFullYear()}-${pad(m.getMonth() + 1)}-${pad(m.getDate())}`;
  const nowMin = m.getHours() * 60 + m.getMinutes();
  const out: string[] = [];
  for (let t = 360; t <= 1140; t += 30) {
    if (date === today && t > nowMin) continue;
    const h24 = Math.floor(t / 60);
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    out.push(`${h12}:${pad(t % 60)} ${h24 >= 12 ? "PM" : "AM"}`);
  }
  return out;
}

function limits(date: string) {
  const now = new Date();
  const m = new Date(now.getTime() + 8 * 60 * 60000 + now.getTimezoneOffset() * 60000);
  const pad = (n: number) => String(n).padStart(2, "0");
  const today = `${m.getFullYear()}-${pad(m.getMonth() + 1)}-${pad(m.getDate())}`;
  const nowMin = m.getHours() * 60 + m.getMinutes();
  return { min: 360, max: date === today ? Math.min(1140, nowMin) : 1140 };
}

// Hours (24-hour) that have at least one allowed minute for the chosen date
export function validHours(date: string): number[] {
  const { min, max } = limits(date);
  if (!date || max < min) return [];
  const out: number[] = [];
  for (let h = Math.floor(min / 60); h <= Math.floor(max / 60); h++) out.push(h);
  return out;
}

export function validMinutes(date: string, h24: number): number[] {
  const { min, max } = limits(date);
  const out: number[] = [];
  for (let m = 0; m < 60; m++) {
    const t = h24 * 60 + m;
    if (t >= min && t <= max) out.push(m);
  }
  return out;
}

export function formatTime(h24: number, m: number): string {
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h24 >= 12 ? "PM" : "AM"}`;
}

export function timeLabelAllowed(date: string, label: string): boolean {
  const mm = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec((label || "").trim());
  if (!mm || !date) return false;
  let h = Number(mm[1]) % 12;
  if (mm[3] === "PM") h += 12;
  const t = h * 60 + Number(mm[2]);
  const { min, max } = limits(date);
  return t >= min && t <= max;
}