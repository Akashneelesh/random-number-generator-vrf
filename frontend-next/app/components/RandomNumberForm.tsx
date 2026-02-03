'use client'

import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useAccount } from "@starknet-react/core";
import { useVrfTransaction } from "../hooks/useVrfTransaction";

interface RandomNumberFormProps {
  onTransactionComplete?: () => void;
}

export default function RandomNumberForm({ onTransactionComplete }: RandomNumberFormProps) {
  const { isConnected } = useAccount();
  const { executeVrfCall, txHash, loading, error } = useVrfTransaction();

  const [min, setMin] = useState<number>(1);
  const [max, setMax] = useState<number>(100);
  const [localError, setLocalError] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Clear local error
    setLocalError("");

    // Validate range
    if (min >= max) {
      setLocalError("Minimum must be less than maximum");
      return;
    }

    try {
      await executeVrfCall(min, max);
      // Clear inputs on success
      setMin(1);
      setMax(100);
    } catch (err) {
      // Error is already set by the hook
      console.error("Transaction failed:", err);
    }
  };

  const isSubmitDisabled = !isConnected || loading || min >= max;

  // Trigger parent refresh when transaction hash changes (transaction submitted)
  // We refresh multiple times to ensure we catch the update after block confirmation
  useEffect(() => {
    if (txHash && onTransactionComplete) {
      // Refresh multiple times to catch the update after confirmation
      const timers = [
        setTimeout(() => onTransactionComplete(), 3000),   // After 3s
        setTimeout(() => onTransactionComplete(), 6000),   // After 6s
        setTimeout(() => onTransactionComplete(), 10000),  // After 10s
        setTimeout(() => onTransactionComplete(), 15000),  // After 15s
      ];
      return () => timers.forEach(t => clearTimeout(t));
    }
  }, [txHash, onTransactionComplete]);

  return (
    <div className="cyber-card p-6">
      <h2 className="text-lg font-bold text-white uppercase tracking-wide mb-4">
        Generate Random Number
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="min"
            className="block mb-2 text-sm font-medium text-gray-300 uppercase tracking-wide"
          >
            Minimum
          </label>
          <input
            id="min"
            type="number"
            min="0"
            value={min}
            onChange={(e) => setMin(Number(e.target.value))}
            disabled={loading}
            className="cyber-input w-full px-4 py-3 rounded text-lg"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="max"
            className="block mb-2 text-sm font-medium text-gray-300 uppercase tracking-wide"
          >
            Maximum
          </label>
          <input
            id="max"
            type="number"
            min="0"
            value={max}
            onChange={(e) => setMax(Number(e.target.value))}
            disabled={loading}
            className="cyber-input w-full px-4 py-3 rounded text-lg"
          />
        </div>

        {localError && (
          <div className="text-red-500 mb-4 text-sm bg-red-500/10 border border-red-500/50 rounded p-3">
            {localError}
          </div>
        )}

        {error && (
          <div className="text-red-500 mb-4 text-sm bg-red-500/10 border border-red-500/50 rounded p-3">
            {error.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="neon-button w-full py-4 rounded text-lg"
        >
          {loading ? "⚡ GENERATING..." : "$ GENERATE RANDOM NUMBER"}
        </button>

        {!isConnected && (
          <div className="mt-4 p-4 text-sm bg-black/50 border border-[#39FF14]/30 rounded text-center">
            <span className="text-[#39FF14] font-semibold">Connect Cartridge Controller wallet</span>
            <span className="text-gray-400"> to generate random numbers.</span>
            <div className="mt-1 text-xs text-gray-500">
              VRF requires Cartridge Controller for paymaster integration
            </div>
          </div>
        )}

        {txHash && (
          <div className="mt-4 p-4 bg-[#39FF14]/10 border border-[#39FF14]/50 rounded text-sm">
            <span className="text-[#39FF14] font-semibold">Transaction submitted:</span>
            <br />
            <a
              href={`https://sepolia.voyager.online/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#39FF14]/70 hover:text-[#39FF14] break-all"
            >
              {txHash}
            </a>
          </div>
        )}
      </form>
    </div>
  );
}
