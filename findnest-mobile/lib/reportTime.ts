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