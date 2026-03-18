"use client";

interface MerchantStatusPillProps {
  status: "in_stock" | "out_of_stock";
}

export default function MerchantStatusPill({ status }: MerchantStatusPillProps) {
  if (status === "in_stock") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-green-700">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
        Cards Available
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
      <span className="h-2 w-2 rounded-full bg-slate-300" />
      Out of Stock
    </span>
  );
}
