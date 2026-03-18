# IFSC data schemas (for context when large files are excluded)

These shapes are used by `app/api/ifsc/search/route.ts` and related APIs. Large files (IFSC.json.gz, merged_banks.json, etc.) are excluded from Claude context; this file describes their structure.

---

## BranchRecord (IFSC.json.gz, npci_ifsc_lookup*.json)

Each branch in the main dataset:

```ts
{
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
}
```

JSON may contain `NaN`; the API replaces `: NaN` with `: null` before parsing.

---

## MergedEntry (merged_banks.json)

Old IFSC → new IFSC mapping (merged banks):

```ts
{
  old_bank_code: string;
  old_bank_name: string;
  new_ifsc: string;
  new_bank_code: string;
  new_bank_name: string;
  old_micr: string;
  new_micr: string;
}
```

Top-level keys are old IFSC codes.

---

## Sub-member (submember_banks.json)

IFSC → display name for co-op/sub-member banks:

```ts
{
  [ifsc: string]: {
    bank_code: string;
    bank_name: string;
    type: "sub-member";
  };
}
```

---

## MissingDetailsEntry (missing_details.json)

User-submitted branch/city/state for IFSCs with missing data (array):

```ts
{
  ifsc: string;
  bank?: string;
  branch?: string;
  city?: string;
  state?: string;
  submittedAt: string; // ISO date
}
```

---

Search logic: load branches + merged + missing_details; prioritize IFSC prefix, then bank name prefix, then other matches; return top 10. Merged IFSCs show a warning and use submember/merged for display.
