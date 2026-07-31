const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const shortDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })

export function formatPrice(cents: number | null): string {
  return cents === null ? 'Doação' : currency.format(cents / 100)
}

export function formatDate(iso: string): string {
  return shortDate.format(new Date(iso))
}

/** "1.204" em vez de "1204" — números grandes na landing precisam respirar. */
export function formatCount(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}
