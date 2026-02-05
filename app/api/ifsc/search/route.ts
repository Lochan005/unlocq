import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { gunzipSync } from "zlib";

export const dynamic = "force-dynamic";
const MAX_RESULTS = 10;

export type BranchRecord = {
  ifsc: string;
  bank: string;
  branch: string;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  contact?: string;
  micr?: string;
  upi?: boolean | string;
  rtgs?: boolean | string;
  neft?: boolean | string;
  imps?: boolean | string;
  swift?: string;
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

type MergedEntry = {
  old_bank_code: string;
  old_bank_name: string;
  new_ifsc: string;
  new_bank_code: string;
  new_bank_name: string;
  old_micr: string;
  new_micr: string;
};

const CACHE_KEY_BRANCHES = "ifsc_search_branches";
const CACHE_KEY_MERGED = "ifsc_search_merged";
const CACHE_KEY_MISSING = "ifsc_search_missing";

type MissingDetailsEntry = {
  ifsc: string;
  bank?: string;
  branch?: string;
  city?: string;
  state?: string;
  submittedAt: string;
};

function getCachedBranches(): BranchRecord[] | null {
  if (typeof globalThis !== "undefined" && (globalThis as Record<string, unknown>)[CACHE_KEY_BRANCHES] != null) {
    return (globalThis as Record<string, BranchRecord[]>)[CACHE_KEY_BRANCHES];
  }
  return null;
}
function setCachedBranches(v: BranchRecord[]) {
  if (typeof globalThis !== "undefined") (globalThis as Record<string, BranchRecord[]>)[CACHE_KEY_BRANCHES] = v;
}
function getCachedMerged(): Record<string, MergedEntry> | null {
  if (typeof globalThis !== "undefined" && (globalThis as Record<string, unknown>)[CACHE_KEY_MERGED] != null) {
    return (globalThis as Record<string, Record<string, MergedEntry>>)[CACHE_KEY_MERGED];
  }
  return null;
}
function setCachedMerged(v: Record<string, MergedEntry>) {
  if (typeof globalThis !== "undefined") (globalThis as Record<string, Record<string, MergedEntry>>)[CACHE_KEY_MERGED] = v;
}
function getCachedMissing(): Record<string, MissingDetailsEntry> | null {
  if (typeof globalThis !== "undefined" && (globalThis as Record<string, unknown>)[CACHE_KEY_MISSING] != null) {
    return (globalThis as Record<string, Record<string, MissingDetailsEntry>>)[CACHE_KEY_MISSING];
  }
  return null;
}
function setCachedMissing(v: Record<string, MissingDetailsEntry>) {
  if (typeof globalThis !== "undefined") (globalThis as Record<string, Record<string, MissingDetailsEntry>>)[CACHE_KEY_MISSING] = v;
}

/** Load from IFSC.json.gz, IFSC (1).json.gz, or IFSC.json (primary) and merged_banks.json (fallback/gap-fill). Search uses BOTH. */
function loadData(dataDir: string) {
  if (!getCachedBranches()) {
    const names = ["IFSC.json.gz", "IFSC.json", "IFSC (1).json.gz", "IFSC (1).json", "IFSC(1).json.gz", "IFSC(1).json"];
    let loaded = false;
    for (const name of names) {
      const ifscPath = path.join(dataDir, name);
      if (!fs.existsSync(ifscPath)) continue;
      try {
        console.log(`[IFSC Search] Attempting to load ${name}...`);
        let raw: string;
        if (name.endsWith(".gz")) {
          console.log(`[IFSC Search] Reading compressed file...`);
          const buffer = fs.readFileSync(ifscPath);
          console.log(`[IFSC Search] Decompressing ${Math.round(buffer.length / 1024 / 1024)} MB...`);
          raw = gunzipSync(buffer).toString("utf-8");
          console.log(`[IFSC Search] Decompressed to ${Math.round(raw.length / 1024 / 1024)} MB`);
        } else {
          raw = fs.readFileSync(ifscPath, "utf-8");
        }
        console.log(`[IFSC Search] Parsing JSON...`);
        const cleaned = raw.replace(/:\s*NaN\s*([,}])/g, ': null$1');
        const data = JSON.parse(cleaned);
        const arr = Array.isArray(data) ? data : [];
        console.log(`[IFSC Search] Parsed ${arr.length} records`);
        if (arr.length > 0) {
          setCachedBranches(arr);
          loaded = true;
          console.log(`[IFSC Search] Successfully loaded ${arr.length} branches from ${name}`);
          break;
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`[IFSC Search] Failed to load ${name}:`, errorMsg);
        if (err instanceof Error && err.stack) {
          console.error(`[IFSC Search] Stack:`, err.stack.substring(0, 500));
        }
        continue;
      }
    }
    if (!loaded) setCachedBranches([]);
  }
  if (!getCachedMerged()) {
    const mergedPath = path.join(dataDir, "merged_banks.json");
    try {
      if (fs.existsSync(mergedPath)) {
        const raw = fs.readFileSync(mergedPath, "utf-8");
        setCachedMerged(JSON.parse(raw) as Record<string, MergedEntry>);
      } else {
        setCachedMerged({});
      }
    } catch {
      setCachedMerged({});
    }
  }
  if (!getCachedMissing()) {
    const missingPath = path.join(dataDir, "missing_details.json");
    try {
      if (fs.existsSync(missingPath)) {
        const raw = fs.readFileSync(missingPath, "utf-8");
        const list = JSON.parse(raw) as MissingDetailsEntry[];
        const byIfsc: Record<string, MissingDetailsEntry> = {};
        for (const entry of list) {
          if (!entry.ifsc) continue;
          const key = entry.ifsc.toUpperCase();
          if (!byIfsc[key] || new Date(entry.submittedAt) > new Date(byIfsc[key].submittedAt)) {
            byIfsc[key] = entry;
          }
        }
        setCachedMissing(byIfsc);
      } else {
        setCachedMissing({});
      }
    } catch {
      setCachedMissing({});
    }
  }
}

function matchQuery(record: BranchRecord, q: string): boolean {
  const nq = normalize(q);
  const qUpper = q.toUpperCase();
  // IFSC: only prefix match so "SB" matches SBIN*, not BARB0DBSBAM
  if (record.ifsc && record.ifsc.toUpperCase().startsWith(qUpper)) return true;
  if (record.ifsc && qUpper.startsWith(record.ifsc.toUpperCase())) return true;
  // Bank, branch, address, city, district, state: substring match
  const textFields = [
    record.bank,
    record.branch,
    record.address,
    record.city,
    record.district,
    record.state,
  ]
    .filter(Boolean)
    .map(String);
  return textFields.some((f) => normalize(f).includes(nq));
}

/** Higher = show first. IFSC prefix > bank name prefix > other match. */
function rankMatch(record: BranchRecord, q: string): number {
  const nq = normalize(q);
  const qUpper = q.toUpperCase();
  const ifscUpper = (record.ifsc ?? "").toUpperCase();
  const bankNorm = normalize(record.bank ?? "");

  if (ifscUpper.startsWith(qUpper)) return 30;
  if (bankNorm.startsWith(nq)) return 20;
  if (record.bank && normalize(record.bank).includes(nq)) return 10;
  if (record.branch && normalize(record.branch).startsWith(nq)) return 7;
  return 5;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 1) {
    return NextResponse.json({ branches: [] });
  }

  const dataDir = path.join(process.cwd(), "data", "ifsc");
  loadData(dataDir);
  const branches = getCachedBranches() ?? [];
  const mergedBanks = getCachedMerged() ?? {};
  const missingDetails = getCachedMissing() ?? {};

  if (branches.length === 0) {
    const cacheBranches = getCachedBranches();
    console.warn(`[IFSC Search] No branches loaded. Query: "${q}"`);
    console.warn(`[IFSC Search] Data dir: ${dataDir}`);
    console.warn(`[IFSC Search] Cache status - branches cached: ${cacheBranches?.length ?? 0}, merged: ${Object.keys(getCachedMerged() ?? {}).length}, missing: ${Object.keys(getCachedMissing() ?? {}).length}`);
    console.warn(`[IFSC Search] Check server logs above for file loading errors`);
    
    return NextResponse.json({
      branches: [],
      debug: process.env.NODE_ENV === "development" ? {
        branchesLoaded: branches.length,
        cacheBranches: cacheBranches?.length ?? 0,
        dataDir,
        message: "No branches loaded. Check server console for errors.",
      } : undefined,
    });
  }

  const byIfsc = new Map<string, BranchRecord>();
  for (const r of branches) {
    if (r.ifsc) {
      const key = r.ifsc.toUpperCase();
      const missing = missingDetails[key];
      byIfsc.set(key, {
        ifsc: r.ifsc,
        bank: r.bank || missing?.bank || "",
        branch: missing?.branch || r.branch || "—",
        address: r.address,
        city: missing?.city || r.city,
        district: r.district,
        state: missing?.state || r.state,
        contact: r.contact != null ? String(r.contact) : undefined,
        micr: r.micr,
        upi: r.upi,
        rtgs: r.rtgs,
        neft: r.neft,
        imps: r.imps,
        swift: r.swift,
      });
    }
  }

  const qUpper = q.toUpperCase();
  for (const entry of Object.values(mergedBanks)) {
    if (!entry.new_ifsc) continue;
    const key = entry.new_ifsc.toUpperCase();
    if (!byIfsc.has(key)) {
      const missing = missingDetails[key];
      byIfsc.set(key, {
        ifsc: entry.new_ifsc,
        bank: entry.new_bank_name,
        branch: missing?.branch || "—",
        city: missing?.city,
        state: missing?.state,
      });
    } else {
      const existing = byIfsc.get(key)!;
      const missing = missingDetails[key];
      if (missing) {
        byIfsc.set(key, {
          ...existing,
          branch: missing.branch || existing.branch || "—",
          city: missing.city || existing.city,
          state: missing.state || existing.state,
        });
      }
    }
  }

  const fullList = Array.from(byIfsc.values());
  const fromSearch = fullList.filter((r) => matchQuery(r, q));

  const fromMerged: BranchRecord[] = [];
  for (const [oldIfsc, entry] of Object.entries(mergedBanks)) {
    if (!entry.new_ifsc) continue;
    if (oldIfsc.toUpperCase() !== qUpper && !oldIfsc.toUpperCase().startsWith(qUpper)) continue;
    const rec = byIfsc.get(entry.new_ifsc.toUpperCase());
    if (rec && !fromMerged.some((r) => r.ifsc.toUpperCase() === rec.ifsc.toUpperCase())) {
      fromMerged.push(rec);
    }
  }

  const seen = new Set<string>();
  const combined: BranchRecord[] = [];
  for (const r of fromMerged) {
    const k = r.ifsc.toUpperCase();
    if (!seen.has(k)) {
      seen.add(k);
      combined.push(r);
    }
  }
  for (const r of fromSearch) {
    const k = r.ifsc.toUpperCase();
    if (!seen.has(k)) {
      seen.add(k);
      combined.push(r);
    }
  }

  combined.sort((a, b) => {
    const rankA = rankMatch(a, q);
    const rankB = rankMatch(b, q);
    if (rankB !== rankA) return rankB - rankA;
    return (a.ifsc || "").localeCompare(b.ifsc || "");
  });

  const filtered = combined.slice(0, MAX_RESULTS);
  return NextResponse.json({ branches: filtered });
}
