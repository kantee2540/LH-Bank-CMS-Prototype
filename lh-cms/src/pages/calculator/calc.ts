/* Formula from CMS-27A:
   r = (rate + rate_buffer) ÷ 100 ÷ 12
   n = years × 12
   payment = ROUNDUP( loan_amount × r × (1 + r)^n ÷ ((1 + r)^n − 1), -2 )   */
export const MIN_AMOUNT = 2_000_000;
export const MAX_AMOUNT = 50_000_000;

export type Rounding = 'hundred' | 'integer';

export interface PmtInput {
  amount: number;
  rate: number;
  years: number;
  buffer?: number;
  rounding?: Rounding;
}

export type PmtResult =
  | { ok: false; error: string }
  | { ok: true; value: number; raw: number; effRate: number; n: number };

export function pmt({ amount, rate, years, buffer = 1, rounding = 'hundred' }: PmtInput): PmtResult {
  if (amount < MIN_AMOUNT) return { ok: false, error: 'แจ้งเตือน: ต่ำกว่า 2 ล้านบาท' };
  if (amount > MAX_AMOUNT) return { ok: false, error: 'แจ้งเตือน: เกิน 50 ล้านบาท' };
  if (years < 3 || years > 30) return { ok: false, error: 'แจ้งเตือน: ระยะเวลา 3 – 30 ปี' };
  if (rate < 0 || rate > 15) return { ok: false, error: 'แจ้งเตือน: อัตรา 0 – 15%' };
  const r = (rate + buffer) / 100 / 12;
  const n = years * 12;
  const raw = r === 0 ? amount / n : (amount * r * (1 + r) ** n) / ((1 + r) ** n - 1);
  const value = rounding === 'hundred' ? Math.ceil(raw / 100) * 100 : Math.round(raw);
  return { ok: true, value, raw, effRate: rate + buffer, n };
}

export const fmt = (n: number): string => n.toLocaleString('en-US');
