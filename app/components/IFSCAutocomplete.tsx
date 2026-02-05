"use client";

import { useState, useRef, useEffect, useCallback } from "react";

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

export type MergedRecord = {
  old_bank_code: string;
  old_bank_name: string;
  new_ifsc: string;
  new_bank_code: string;
  new_bank_name: string;
  old_micr: string;
  new_micr: string;
};

export type SubmemberRecord = {
  bank_code: string;
  bank_name: string;
  type: string;
};

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const DASH = "—";

function isValidIFSCFormat(ifsc: string): boolean {
  return ifsc.length === 11 && IFSC_REGEX.test(ifsc);
}

function isEmpty(s: string | undefined): boolean {
  return s == null || String(s).trim() === "" || String(s).trim() === DASH;
}

function hasMissingBranchDetails(branch: BranchRecord): boolean {
  return isEmpty(branch.branch) || isEmpty(branch.city) || isEmpty(branch.state);
}

function formatBranchLine(branch: BranchRecord): string {
  const parts = [branch.branch, branch.city, branch.state]
    .filter((s) => s != null && String(s).trim() !== "" && String(s).trim() !== DASH)
    .map(String);
  return parts.join(", ");
}

interface IFSCAutocompleteProps {
  value: string;
  onChange: (ifsc: string) => void;
  onBranchSelect?: (branch: BranchRecord, displayBankName: string) => void;
  onMergedWarning?: (merged: MergedRecord) => void;
  placeholder?: string;
  id?: string;
  required?: boolean;
  className?: string;
  label?: string;
  helpText?: string;
}

export default function IFSCAutocomplete({
  value,
  onChange,
  onBranchSelect,
  onMergedWarning,
  placeholder = "e.g. SBIN0001234",
  id = "ifsc",
  required = false,
  className = "",
  label = "IFSC code",
  helpText,
}: IFSCAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<BranchRecord[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mergedWarning, setMergedWarning] = useState<MergedRecord | null>(null);
  const [displayBankName, setDisplayBankName] = useState<string | null>(null);
  const [missingDetailsBranch, setMissingDetailsBranch] = useState<BranchRecord | null>(null);
  const [missingBranch, setMissingBranch] = useState("");
  const [missingCity, setMissingCity] = useState("");
  const [missingState, setMissingState] = useState("");
  const [submittingMissing, setSubmittingMissing] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 1) {
      setSuggestions([]);
      return;
    }
    setOpen(true);
    setLoading(true);
    try {
      const res = await fetch(`/api/ifsc/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data.branches ?? []);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkMerged = useCallback(async (ifsc: string) => {
    if (ifsc.length !== 11) return;
    try {
      const res = await fetch(`/api/ifsc/check-merged?ifsc=${encodeURIComponent(ifsc)}`);
      const data = await res.json();
      if (data.merged) {
        setMergedWarning(data.merged);
        if (onMergedWarning) onMergedWarning(data.merged);
      } else {
        setMergedWarning(null);
      }
    } catch {
      setMergedWarning(null);
    }
  }, [onMergedWarning]);

  const checkSubmember = useCallback(async (ifsc: string): Promise<string | null> => {
    if (ifsc.length !== 11) return null;
    try {
      const res = await fetch(`/api/ifsc/submember?ifsc=${encodeURIComponent(ifsc)}`);
      const data = await res.json();
      if (data.submember?.bank_name) {
        return data.submember.bank_name;
      }
    } catch {}
    return null;
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = inputValue.trim().toUpperCase();
    if (q.length < 1) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => fetchSuggestions(q), 120);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputValue, fetchSuggestions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (branch: BranchRecord) => {
    const ifsc = branch.ifsc;
    setInputValue(ifsc);
    onChange(ifsc);
    setSuggestions([]);
    setOpen(false);
    setMergedWarning(null);

    const subName = await checkSubmember(ifsc);
    const nameToShow = subName ?? branch.bank;
    setDisplayBankName(nameToShow);
    onBranchSelect?.(branch, nameToShow);

    if (hasMissingBranchDetails(branch)) {
      setMissingDetailsBranch(branch);
      setMissingBranch("");
      setMissingCity("");
      setMissingState("");
    }

    await checkMerged(ifsc);
  };

  const submitMissingDetails = async () => {
    if (!missingDetailsBranch) return;
    setSubmittingMissing(true);
    try {
      const res = await fetch("/api/ifsc/missing-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ifsc: missingDetailsBranch.ifsc,
          bank: missingDetailsBranch.bank,
          branch: missingBranch.trim() || undefined,
          city: missingCity.trim() || undefined,
          state: missingState.trim() || undefined,
        }),
      });
      if (res.ok) {
        const updated: BranchRecord = {
          ...missingDetailsBranch,
          branch: missingBranch.trim() || missingDetailsBranch.branch,
          city: missingCity.trim() || missingDetailsBranch.city,
          state: missingState.trim() || missingDetailsBranch.state,
        };
        onBranchSelect?.(updated, displayBankName ?? updated.bank);
        setMissingDetailsBranch(null);
        setMissingBranch("");
        setMissingCity("");
        setMissingState("");
      }
    } finally {
      setSubmittingMissing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.slice(0, 11).toUpperCase().replace(/[^A-Z0-9]/g, "");
    setInputValue(v);
    onChange(v);
    setMergedWarning(null);
    setDisplayBankName(null);
  };

  const handleBlur = () => {
    if (inputValue.length === 11) checkMerged(inputValue);
  };

  const applyNewIFSC = () => {
    if (mergedWarning?.new_ifsc) {
      setInputValue(mergedWarning.new_ifsc);
      onChange(mergedWarning.new_ifsc);
      setMergedWarning(null);
    }
  };

  const isValid = inputValue.length === 0 || isValidIFSCFormat(inputValue);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[#5B4B8A] mb-1.5">
          {label}
        </label>
      )}
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={() => inputValue.length >= 1 && setOpen(true)}
        maxLength={11}
        required={required}
        autoComplete="off"
        className={`w-full px-4 py-3 rounded-lg border-2 bg-white text-[#5B4B8A] placeholder-[#8E7BB8]/60 focus:outline-none focus:ring-2 focus:ring-[#B19CD7]/30 focus:border-[#B19CD7] font-mono uppercase ${
          !isValid ? "border-red-300" : "border-[#EBE8FC]"
        }`}
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={open ? "ifsc-listbox" : undefined}
        role="combobox"
      />

      {open && (suggestions.length > 0 || loading) && (
        <ul
          id="ifsc-listbox"
          role="listbox"
          className="absolute z-50 w-full mt-1 py-1 bg-white border-2 border-[#EBE8FC] rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {loading && suggestions.length === 0 && (
            <li className="px-4 py-3 text-sm text-[#8E7BB8]">Searching...</li>
          )}
          {suggestions.map((branch) => (
            <li
              key={branch.ifsc}
              role="option"
              tabIndex={0}
              className="px-4 py-3 cursor-pointer hover:bg-[#F5F3FF] focus:bg-[#F5F3FF] focus:outline-none border-b border-[#EBE8FC]/50 last:border-b-0"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(branch);
              }}
            >
              <div className="text-sm text-[#5B4B8A]">
                {branch.ifsc}
                {!isEmpty(branch.bank) ? ` - ${branch.bank}` : ""}
              </div>
              {formatBranchLine(branch) ? (
                <div className="text-sm text-[#5B4B8A]/90 mt-0.5">
                  {formatBranchLine(branch)}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {inputValue.length > 0 && inputValue.length < 11 && !isValid && (
        <p className="mt-1 text-xs text-red-500">IFSC must be 11 characters (e.g. SBIN0001234)</p>
      )}

      {mergedWarning && (
        <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-sm font-medium text-amber-800">
            {mergedWarning.old_bank_name} merged with {mergedWarning.new_bank_name}.
          </p>
          <p className="text-xs text-amber-700 mt-1">
            New IFSC: <span className="font-mono font-semibold">{mergedWarning.new_ifsc}</span>
          </p>
          <button
            type="button"
            onClick={applyNewIFSC}
            className="mt-2 text-sm font-medium text-[#7C5CBF] hover:underline"
          >
            Use new IFSC
          </button>
        </div>
      )}

      {helpText && !mergedWarning && (
        <p className="mt-1 text-xs text-[#8E7BB8]">{helpText}</p>
      )}

      {missingDetailsBranch && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="missing-details-title"
        >
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 border border-[#EBE8FC]">
            <h3 id="missing-details-title" className="text-sm font-semibold text-[#5B4B8A] mb-2">
              Improve your experience
            </h3>
            <p className="text-sm text-[#5B4B8A]/90 mb-4">
              Please mention the branch and city detail so we can improve our records.
            </p>
            <div className="space-y-3">
              <div>
                <label htmlFor="missing-branch" className="block text-xs font-medium text-[#5B4B8A] mb-1">
                  Branch
                </label>
                <input
                  id="missing-branch"
                  type="text"
                  placeholder="Branch name"
                  value={missingBranch}
                  onChange={(e) => setMissingBranch(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#EBE8FC] text-sm text-[#5B4B8A] placeholder-[#8E7BB8]/60 focus:outline-none focus:ring-2 focus:ring-[#B19CD7]/30"
                />
              </div>
              <div>
                <label htmlFor="missing-city" className="block text-xs font-medium text-[#5B4B8A] mb-1">
                  City
                </label>
                <input
                  id="missing-city"
                  type="text"
                  placeholder="City"
                  value={missingCity}
                  onChange={(e) => setMissingCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#EBE8FC] text-sm text-[#5B4B8A] placeholder-[#8E7BB8]/60 focus:outline-none focus:ring-2 focus:ring-[#B19CD7]/30"
                />
              </div>
              <div>
                <label htmlFor="missing-state" className="block text-xs font-medium text-[#5B4B8A] mb-1">
                  State (optional)
                </label>
                <input
                  id="missing-state"
                  type="text"
                  placeholder="State"
                  value={missingState}
                  onChange={(e) => setMissingState(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#EBE8FC] text-sm text-[#5B4B8A] placeholder-[#8E7BB8]/60 focus:outline-none focus:ring-2 focus:ring-[#B19CD7]/30"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setMissingDetailsBranch(null);
                  setMissingBranch("");
                  setMissingCity("");
                  setMissingState("");
                }}
                className="flex-1 py-2 rounded-lg text-sm font-medium text-[#5B4B8A] border border-[#EBE8FC] hover:bg-[#F5F3FF]"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={submitMissingDetails}
                disabled={submittingMissing}
                className="flex-1 py-2 rounded-lg text-sm font-medium text-white bg-[#9678CD] hover:bg-[#7C5CBF] disabled:opacity-60"
              >
                {submittingMissing ? "Submitting…" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function PaymentBadges({ branch }: { branch: BranchRecord }) {
  const supports = [
    branch.neft && { label: "NEFT", key: "neft" },
    branch.rtgs && { label: "RTGS", key: "rtgs" },
    branch.imps && { label: "IMPS", key: "imps" },
    branch.upi && { label: "UPI", key: "upi" },
  ].filter(Boolean) as { label: string; key: string }[];

  if (supports.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {supports.map(({ label, key }) => (
        <span
          key={key}
          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
        >
          ✓ {label}
        </span>
      ))}
    </div>
  );
}
