"use client";

interface ComplianceFooterProps {
  variant: "earn" | "pool";
}

const disclosures: Record<"earn" | "pool", string> = {
  earn: "Reward availability and amounts depend on our partner agreements and may change without notice. UnLoQ1 does not guarantee any specific reward rate or amount from shopping activity.",
  pool: "Your rewards pool is not a wallet or stored-value account. It represents earned entitlements that UnLoQ1 will apply toward your loan prepayment or other redemption options on your behalf.",
};

export default function ComplianceFooter({ variant }: ComplianceFooterProps) {
  return (
    <div className="mt-8 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="text-[11px] leading-relaxed text-slate-400">
        {disclosures[variant]}
      </p>
    </div>
  );
}
