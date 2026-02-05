# IFSC data

## Files

| File | Purpose |
|------|---------|
| **IFSC (1).json** / **IFSC.json.gz** | Primary autocomplete source. Full branch list (ifsc, bank, branch, city, state, etc.). |
| **merged_banks.json** | Gap-fill and merged-bank mapping. Old IFSC → new IFSC. |
| **submember_banks.json** | Sub-member (co-op) banks. Used to display actual bank name instead of parent bank. |
| **missing_details.json** | User-submitted branch/city/state for IFSCs that had missing data (created by the app when users submit the “improve your experience” form). Use this to backfill the main dataset. |
| **npci_ifsc_lookup.json** / **.min.json** | Alternate full branch list. |
| **SCHEMA.md** | Data shapes for all above (for context when large files are excluded). |

Search uses both IFSC (1).json and merged_banks.json. Top 10 results are returned.
