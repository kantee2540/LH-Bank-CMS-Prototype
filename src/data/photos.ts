/* ภาพตัวอย่างจากเว็บไซต์ lhbank.co.th — ใช้แทนช่องสีใน Prototype (ย่อขนาดแล้ว ไม่เกิน 960 px) */
import advisoryEsg from '../assets/photos/advisory-esg.jpg';
import advisoryReits from '../assets/photos/advisory-reits.jpg';
import advisoryWinnerLoser from '../assets/photos/advisory-winner-loser.jpg';
import appLhbYou from '../assets/photos/app-lhb-you.jpg';
import bannerFundRmf from '../assets/photos/banner-fund-rmf.jpg';
import bannerIpo from '../assets/photos/banner-ipo.jpg';
import bannerTaxSaving from '../assets/photos/banner-tax-saving.jpg';
import bannerVision from '../assets/photos/banner-vision.jpg';
import branch from '../assets/photos/branch.jpg';
import cardlessWithdrawal from '../assets/photos/cardless-withdrawal.jpg';
import creditCard from '../assets/photos/credit-card.jpg';
import debitCard from '../assets/photos/debit-card.jpg';
import familyAdvisor from '../assets/photos/family-advisor.jpg';
import familyBanking from '../assets/photos/family-banking.jpg';
import firstJob from '../assets/photos/first-job.jpg';
import heroLhbYou from '../assets/photos/hero-lhb-you.jpg';
import mobileBanking from '../assets/photos/mobile-banking.jpg';
import newsMouChula from '../assets/photos/news-mou-chula.jpg';
import npaCondo from '../assets/photos/npa-condo.jpg';
import npaHouse from '../assets/photos/npa-house.jpg';
import npaLand from '../assets/photos/npa-land.jpg';
import npaShophouse from '../assets/photos/npa-shophouse.jpg';
import npaTownhome from '../assets/photos/npa-townhome.jpg';
import saving from '../assets/photos/saving.jpg';
import weeklyAmericanRoulette from '../assets/photos/weekly-american-roulette.jpg';
import weeklyCloserToNormal from '../assets/photos/weekly-closer-to-normal.jpg';
import weeklyCreditHorizon from '../assets/photos/weekly-credit-horizon.jpg';

export const PHOTOS = {
  advisoryEsg,
  advisoryReits,
  advisoryWinnerLoser,
  appLhbYou,
  bannerFundRmf,
  bannerIpo,
  bannerTaxSaving,
  bannerVision,
  branch,
  cardlessWithdrawal,
  creditCard,
  debitCard,
  familyAdvisor,
  familyBanking,
  firstJob,
  heroLhbYou,
  mobileBanking,
  newsMouChula,
  npaCondo,
  npaHouse,
  npaLand,
  npaShophouse,
  npaTownhome,
  saving,
  weeklyAmericanRoulette,
  weeklyCloserToNormal,
  weeklyCreditHorizon,
} as const;
export type PhotoKey = keyof typeof PHOTOS;

/* ชื่อไฟล์ใน Media Library → ภาพจริง (จับคู่ตามคำในชื่อไฟล์) */
const RULES: [RegExp, PhotoKey][] = [
  [/evoucher|hero-.*lhb|lhb-you-hero/, 'heroLhbYou'],
  [/app-lhb|lhb-you|lhbyou/, 'appLhbYou'],
  [/fixed|deposit|saving|เงินฝาก/, 'saving'],
  [/retention|family/, 'familyBanking'],
  [/richman|tax/, 'bannerTaxSaving'],
  [/first-job|first_job/, 'firstJob'],
  [/lifestage/, 'familyAdvisor'],
  [/weekly|advisory/, 'weeklyCreditHorizon'],
  [/monthly|outlook/, 'weeklyAmericanRoulette'],
  [/news|smart-money|mou/, 'newsMouChula'],
  [/fund|rmf|esg/, 'bannerFundRmf'],
  [/credit|card/, 'creditCard'],
  [/loan|home|refinance/, 'familyAdvisor'],
  [/npa|condo/, 'npaCondo'],
  [/og-|vision/, 'bannerVision'],
];
const FALLBACK: PhotoKey[] = ['branch', 'mobileBanking', 'saving', 'familyAdvisor', 'debitCard', 'firstJob'];

export function photoFor(name?: string): string {
  const n = (name ?? '').toLowerCase();
  const hit = RULES.find(([re]) => re.test(n));
  if (hit) return PHOTOS[hit[1]];
  let h = 0;
  for (const c of n) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PHOTOS[FALLBACK[h % FALLBACK.length]];
}
