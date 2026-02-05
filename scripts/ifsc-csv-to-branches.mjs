#!/usr/bin/env node
/**
 * Converts IFSC.csv to data/ifsc/branches.json for the IFSC autocomplete.
 *
 * Usage:
 *   node scripts/ifsc-csv-to-branches.mjs [path-to-IFSC.csv]
 *
 * If no path is given, reads data/ifsc/IFSC.csv from the project root.
 * Output: data/ifsc/branches.json
 *
 * Expected CSV columns (case-insensitive, any of these names):
 *   IFSC, BANK, BRANCH, ADDRESS, CITY, DISTRICT, STATE, CONTACT, MICR,
 *   UPI, RTGS, NEFT, IMPS, SWIFT
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const COLUMN_MAP = {
  ifsc: ["ifsc", "IFSC", "ifsc_code"],
  bank: ["bank", "BANK", "bank_name", "BANK NAME"],
  branch: ["branch", "BRANCH", "branch_name", "BRANCH NAME"],
  address: ["address", "ADDRESS"],
  city: ["city", "CITY"],
  district: ["district", "DISTRICT"],
  state: ["state", "STATE"],
  contact: ["contact", "CONTACT", "phone", "PHONE"],
  micr: ["micr", "MICR"],
  upi: ["upi", "UPI"],
  rtgs: ["rtgs", "RTGS"],
  neft: ["neft", "NEFT"],
  imps: ["imps", "IMPS"],
  swift: ["swift", "SWIFT"],
};

function parseCSVLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if ((c === "," && !inQuotes) || (c === "\n" && !inQuotes)) {
      out.push(cur.trim());
      cur = "";
      if (c === "\n") break;
    } else {
      cur += c;
    }
  }
  out.push(cur.trim());
  return out;
}

function parseCSV(content) {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    rows.push(parseCSVLine(lines[i]));
  }
  return { headers, rows };
}

function mapHeadersToKeys(headers) {
  const keyByIndex = [];
  for (let i = 0; i < headers.length; i++) {
    const h = (headers[i] || "").trim().toLowerCase().replace(/\s+/g, "_");
    let key = null;
    for (const [k, aliases] of Object.entries(COLUMN_MAP)) {
      if (aliases.some((a) => a.toLowerCase().replace(/\s+/g, "_") === h || a === headers[i])) {
        key = k;
        break;
      }
    }
    keyByIndex.push(key);
  }
  return keyByIndex;
}

function parseBoolOrString(val) {
  if (val == null || val === "") return undefined;
  const v = String(val).toLowerCase().trim();
  if (v === "true" || v === "1" || v === "yes" || v === "y") return true;
  if (v === "false" || v === "0" || v === "no" || v === "n") return false;
  return val;
}

function rowToRecord(row, keyByIndex) {
  const record = {};
  for (let i = 0; i < row.length && i < keyByIndex.length; i++) {
    const key = keyByIndex[i];
    const raw = row[i];
    const val = raw == null ? "" : String(raw).trim();
    if (!key || val === "") continue;
    if (["upi", "rtgs", "neft", "imps"].includes(key)) {
      record[key] = parseBoolOrString(val);
    } else {
      record[key] = val;
    }
  }
  if (!record.ifsc) return null;
  record.bank = record.bank || "";
  record.branch = record.branch || "";
  return record;
}

function main() {
  const csvPath = process.argv[2]
    ? path.resolve(process.cwd(), process.argv[2])
    : path.join(projectRoot, "data", "ifsc", "IFSC.csv");

  if (!fs.existsSync(csvPath)) {
    console.error("CSV file not found:", csvPath);
    console.error("Usage: node scripts/ifsc-csv-to-branches.mjs [path-to-IFSC.csv]");
    process.exit(1);
  }

  const content = fs.readFileSync(csvPath, "utf-8");
  const { headers, rows } = parseCSV(content);
  const keyByIndex = mapHeadersToKeys(headers);

  const branches = [];
  for (const row of rows) {
    const record = rowToRecord(row, keyByIndex);
    if (record) branches.push(record);
  }

  const outPath = path.join(projectRoot, "data", "ifsc", "branches.json");
  fs.writeFileSync(outPath, JSON.stringify(branches, null, 2), "utf-8");
  console.log("Wrote", branches.length, "branches to", outPath);
}

main();
