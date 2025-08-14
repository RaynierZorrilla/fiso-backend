export function monthRange(month: string) {
    const [y, m] = month.split("-").map(Number);
    const from = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
    const to = new Date(Date.UTC(y, m, 1, 0, 0, 0));
    return { from, to };
  }
  
  export function currentMonthYYYYMM(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = (now.getMonth() + 1).toString().padStart(2, "0");
    return `${y}-${m}`;
  }
  