/**
 * Fee figures for every page on this site, fetched at render time from the
 * shared "WDC Fee Terms" Google Sheet through its gviz JSON endpoint, so one
 * sheet edit updates every WDC site. If the sheet cannot be reached or a
 * value is missing, the baked-in fallback below renders instead, so fee copy
 * never comes back blank.
 *
 * Sheet: https://docs.google.com/spreadsheets/d/1Lpuj0Jus84Zz2iMiDAf-oTQMNIfIoqv3aIGgVd7n_vk/edit
 * Editing rules: keep the Value column formatted as plain text and edit the
 * values in place (e.g. "1.50%", "$500K"). Unknown keys are ignored.
 */

export interface FeeTerms {
  fundingMax: string;
  tier1Cap: string;
  tier1Rate: string;
  tier1Minimum: string;
  tier2Cap: string;
  tier2Rate: string;
  tier3Rate: string;
  extraDayRate: string;
  twoClosingCompaniesRate: string;
  specialTermsRate: string;
}

/** Last-known-good values baked into the site. Rendered whenever the sheet
 *  cannot be reached, so the fallback never blanks the fees. */
export const fallbackFeeTerms: FeeTerms = {
  fundingMax: "$1.5M",
  tier1Cap: "$500K",
  tier1Rate: "1%",
  tier1Minimum: "$1,000",
  tier2Cap: "$1M",
  tier2Rate: "1.25%",
  tier3Rate: "1.50%",
  extraDayRate: "0.2%",
  twoClosingCompaniesRate: "1.75%",
  specialTermsRate: "1.75%"
};

const GVIZ_URL = "https://docs.google.com/spreadsheets/d/1Lpuj0Jus84Zz2iMiDAf-oTQMNIfIoqv3aIGgVd7n_vk/gviz/tq?tqx=out:json&sheet=fees";
const CACHE_TTL_MS = 180_000; // 3 minutes: sheet edits go live within minutes

const store = globalThis as { __feeTermsCache?: { at: number; terms: FeeTerms } };

export async function getFeeTerms(): Promise<FeeTerms> {
  const now = Date.now();
  const cached = store.__feeTermsCache;
  if (cached && now - cached.at < CACHE_TTL_MS) return cached.terms;
  try {
    const res = await fetch(GVIZ_URL, { cf: { cacheTtl: 180, cacheEverything: true } } as RequestInit);
    if (!res.ok) throw new Error(`gviz responded ${res.status}`);
    const text = await res.text();
    const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
    const fromSheet: Record<string, string> = {};
    for (const row of json?.table?.rows ?? []) {
      const key = row?.c?.[0]?.v;
      const cell = row?.c?.[1];
      const value = cell?.f ?? cell?.v;
      if (typeof key === "string" && value != null && String(value).trim() !== "") {
        fromSheet[key.trim()] = String(value).trim();
      }
    }
    const terms = { ...fallbackFeeTerms };
    for (const key of Object.keys(terms) as (keyof FeeTerms)[]) {
      if (fromSheet[key]) terms[key] = fromSheet[key];
    }
    store.__feeTermsCache = { at: now, terms };
    return terms;
  } catch {
    // Sheet unreachable or unparsable: serve the last good values when we
    // have them, else the baked-in fallback. Fees must never render blank.
    return cached?.terms ?? fallbackFeeTerms;
  }
}

/** Replace {{feeKey}} placeholders in copy with the current fee values. */
export function renderFees(text: string, terms: FeeTerms): string {
  return text.replace(
    /\{\{(fundingMax|tier1Cap|tier1Rate|tier1Minimum|tier2Cap|tier2Rate|tier3Rate|extraDayRate|twoClosingCompaniesRate|specialTermsRate)\}\}/g,
    (match, key) => terms[key as keyof FeeTerms] ?? match
  );
}

/** The published fee schedule shown on every page. */
export const feeSchedule = (t: FeeTerms): { label: string; detail: string }[] => [
  { label: `Up to ${t.tier1Cap}`, detail: `${t.tier1Rate} (${t.tier1Minimum} minimum)` },
  { label: `${t.tier1Cap} to ${t.tier2Cap}`, detail: t.tier2Rate },
  { label: `${t.tier2Cap} to ${t.fundingMax}`, detail: t.tier3Rate },
  { label: "Additional days", detail: `${t.extraDayRate} per day` },
  { label: "Two title or closing companies", detail: t.twoClosingCompaniesRate },
  { label: `Funding over ${t.tier2Cap}`, detail: "Longer due diligence" },
  { label: "Morby Method", detail: "Fees paid upfront via Zelle or wire" },
  { label: "Additional paperwork or special terms", detail: `${t.specialTermsRate} or a per-document fee at our team's discretion` }
];

/** Worked-example math: feeAmount(300000, t.tier1Rate) -> "$3,000" */
export const feeAmount = (fundedDollars: number, rate: string): string =>
  "$" + Math.round(fundedDollars * parseFloat(rate) / 100).toLocaleString("en-US");
