export function formatWon(amount: number): string {
  return `${Math.round(amount).toLocaleString("ko-KR")}원`;
}

export function formatKcal(amount: number): string {
  return `${Math.round(amount).toLocaleString("ko-KR")}kcal`;
}
