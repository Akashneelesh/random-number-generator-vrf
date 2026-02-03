'use client'

import { useState } from "react";
import { useAccount } from "@starknet-react/core";
import { buildVrfCalls } from "../utils/vrfHelpers";
import { RANDOM_RANGE_GENERATOR_ADDRESS } from "../contracts/constants";

/**
 * Hook for executing VRF transactions with the RandomRangeGenerator contract.
 *
 * Provides a clean API for generating random numbers within a specified range
 * using Cartridge VRF on Starknet.
 *
 * IMPORTANT: VRF transactions REQUIRE Cartridge Controller wallet because:
 * - The Cartridge Paymaster intercepts request_random calls
 * - It generates the VRF proof and wraps transactions with submit_random/assert_consumed
 * - Standard wallets (Argent, Braavos) will fail with "VrfProvider: not fulfilled"
 *
 * @returns Transaction execution interface with loading/error states
 *
 * @example
 * ```typescript
 * const { executeVrfCall, txHash, loading, error, reset } = useVrfTransaction();
 *
 * const handleGenerateRandom = async () => {
 *   try {
 *     await executeVrfCall(1000, 1300);
 *     console.log("Transaction hash:", txHash);
 *   } catch (err) {
 *     console.error("Transaction failed:", error);
 *   }
 * };
 * ```
 */
export const useVrfTransaction = () => {
  const { account, connector } = useAccount();
  const [txHash, setTxHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Executes a VRF transaction to generate a random number in the specified range.
   *
   * @param min - Minimum value of the range (inclusive)
   * @param max - Maximum value of the range (inclusive)
   * @throws {Error} If wallet is not connected
   * @throws {Error} If wrong wallet type is used (must be Cartridge Controller)
   * @throws {Error} If min >= max
   * @throws {Error} If transaction is rejected or fails
   */
  const executeVrfCall = async (min: number, max: number): Promise<void> => {
    // Reset previous state
    setError(null);
    setTxHash(null);

    try {
      // Validate wallet connection
      if (!account) {
        throw new Error("Wallet not connected. Please connect your wallet to continue.");
      }

      // Validate wallet type - MUST be Cartridge Controller for VRF
      const isCartridgeConnector = connector &&
        (connector.id === "controller" || connector.name.toLowerCase().includes("cartridge"));

      if (!isCartridgeConnector) {
        throw new Error(
          "VRF requires Cartridge Controller wallet. " +
          "Please disconnect and connect using Cartridge Controller. " +
          "Standard wallets (Argent, Braavos) don't support VRF paymaster integration."
        );
      }

      // Validate range
      if (min >= max) {
        throw new Error(`Invalid range: min (${min}) must be less than max (${max})`);
      }

      setLoading(true);

      // Build VRF multicall: [request_random, generate_random_in_range]
      const calls = buildVrfCalls({
        contractAddress: RANDOM_RANGE_GENERATOR_ADDRESS,
        accountAddress: account.address,
        entrypoint: "generate_random_in_range",
        calldata: [min, max],
      });

      // Execute transaction through Cartridge Controller wallet
      // The Cartridge Paymaster will automatically:
      // 1. Intercept the request_random call
      // 2. Generate the VRF proof
      // 3. Wrap with: [submit_random, request_random, generate_random_in_range, assert_consumed]
      const result = await account.execute(calls);

      // Store transaction hash for status tracking
      setTxHash(result.transaction_hash);
    } catch (err) {
      // Handle different error scenarios
      const error = err as Error;
      const errorMessage = error.message || String(error);

      // VRF-specific errors
      if (errorMessage.includes("not fulfilled") || errorMessage.includes("VrfProvider")) {
        setError(new Error(
          "VRF Provider Error: Random value not fulfilled. " +
          "This usually means you're not using Cartridge Controller wallet. " +
          "Please disconnect and connect with Cartridge Controller."
        ));
      }
      // Wallet type validation (from our check above)
      else if (errorMessage.includes("Cartridge Controller wallet")) {
        setError(error);
      }
      // User rejected transaction in wallet
      else if (errorMessage.includes("User abort") || errorMessage.includes("rejected")) {
        setError(new Error("Transaction rejected by user"));
      }
      // Network or RPC errors
      else if (errorMessage.includes("network") || errorMessage.includes("timeout")) {
        setError(new Error("Network error. Please check your connection and try again."));
      }
      // Contract execution errors
      else if (errorMessage.includes("execution") || errorMessage.includes("revert")) {
        setError(new Error(
          "Transaction execution failed. " +
          "This might be a contract error or VRF paymaster issue. " +
          "Ensure you're using Cartridge Controller wallet."
        ));
      }
      // Generic fallback
      else {
        setError(error);
      }

      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resets the hook state to initial values.
   * Useful for clearing error messages or preparing for a new transaction.
   */
  const reset = () => {
    setTxHash(null);
    setLoading(false);
    setError(null);
  };

  return {
    executeVrfCall,
    txHash,
    loading,
    error,
    reset,
  };
};
