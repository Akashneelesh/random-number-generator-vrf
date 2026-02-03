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
    <div style={{
      border: "1px solid #e0e0e0",
      borderRadius: "0.5rem",
      padding: "1.5rem",
      backgroundColor: "white",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1.25rem" }}>
        Generate Random Number
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="min"
            style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}
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
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "0.25rem",
              fontSize: "1rem",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="max"
            style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}
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
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "0.25rem",
              fontSize: "1rem",
              boxSizing: "border-box"
            }}
          />
        </div>

        {localError && (
          <div style={{
            color: "#dc2626",
            marginBottom: "1rem",
            fontSize: "0.875rem"
          }}>
            {localError}
          </div>
        )}

        {error && (
          <div style={{
            color: "#dc2626",
            marginBottom: "1rem",
            fontSize: "0.875rem",
            padding: "0.5rem",
            backgroundColor: "#fee",
            borderRadius: "0.25rem"
          }}>
            {error.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitDisabled}
          style={{
            width: "100%",
            padding: "0.75rem",
            border: "none",
            borderRadius: "0.25rem",
            backgroundColor: isSubmitDisabled ? "#ccc" : "#646cff",
            color: "white",
            fontSize: "1rem",
            fontWeight: 500,
            cursor: isSubmitDisabled ? "not-allowed" : "pointer",
            transition: "background-color 0.2s"
          }}
        >
          {loading ? "Generating..." : "Generate Random Number"}
        </button>

        {!isConnected && (
          <div style={{
            marginTop: "0.75rem",
            padding: "0.75rem",
            fontSize: "0.875rem",
            backgroundColor: "#f0f9ff",
            borderRadius: "0.25rem",
            textAlign: "center",
            border: "1px solid #bfdbfe"
          }}>
            <strong>Connect Cartridge Controller wallet</strong> to generate random numbers.
            <div style={{ marginTop: "0.25rem", fontSize: "0.75rem", color: "#666" }}>
              VRF requires Cartridge Controller for paymaster integration
            </div>
          </div>
        )}

        {txHash && (
          <div style={{
            marginTop: "1rem",
            padding: "0.75rem",
            backgroundColor: "#f0f9ff",
            borderRadius: "0.25rem",
            fontSize: "0.875rem"
          }}>
            <strong>Transaction submitted:</strong>
            <br />
            <a
              href={`https://sepolia.voyager.online/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#646cff",
                textDecoration: "none",
                wordBreak: "break-all"
              }}
            >
              {txHash}
            </a>
          </div>
        )}
      </form>
    </div>
  );
}
