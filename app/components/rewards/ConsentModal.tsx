"use client";

import { useRewardsStore } from "@/app/lib/rewards/store";
import { ShoppingCart, Check, X } from "@phosphor-icons/react";

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConsentModal({ isOpen, onClose }: ConsentModalProps) {
  const grantConsent = useRewardsStore((state) => state.grantConsent);

  if (!isOpen) return null;

  const handleAgree = () => {
    grantConsent();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="mx-4 w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
            <ShoppingCart size={32} weight="duotone" className="text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">
            Enable Shopping Rewards
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Earn rewards on your everyday purchases that go toward your loan
            prepayment.
          </p>
        </div>

        <div className="mb-6 rounded-xl bg-slate-50 p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">
            How it works
          </h3>
          <p className="mb-4 text-xs leading-relaxed text-slate-500">
            UnLoQ1 partners with affiliate networks to earn a small commission
            when you shop through our links. A portion of this commission goes to
            your prepayment pool.
          </p>

          <h3 className="mb-2 text-sm font-semibold text-slate-700">
            What we share
          </h3>
          <div className="space-y-2 text-xs text-slate-500">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-green-500"><Check size={14} weight="bold" /></span>
              <span>
                An anonymous tracking ID when you click through to a merchant
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-red-500"><X size={14} weight="bold" /></span>
              <span>
                Your name, email, phone number, or any personal information is{" "}
                <strong className="text-slate-700">never shared</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border-2 border-slate-200 px-4 py-3 text-sm font-semibold text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            Not Now
          </button>
          <button
            onClick={handleAgree}
            className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-200 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-300"
          >
            I Agree
          </button>
        </div>
      </div>
    </div>
  );
}
