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
  const { account } = useAccount();
  const [txHash, setTxHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Executes a VRF transaction to generate a random number in the specified range.
   *
   * @param min - Minimum value of the range (inclusive)
   * @param max - Maximum value of the range (inclusive)
   * @throws {Error} If wallet is not connected
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

      // Execute transaction through user's wallet
      // Paymaster will automatically wrap with VRF proof verification
      const result = await account.execute(calls);

      // Store transaction hash for status tracking
      setTxHash(result.transaction_hash);
    } catch (err) {
      // Handle different error scenarios
      const error = err as Error;

      // User rejected transaction in wallet
      if (error.message.includes("User abort")) {
        setError(new Error("Transaction rejected by user"));
      }
      // Network or RPC errors
      else if (error.message.includes("network") || error.message.includes("timeout")) {
        setError(new Error("Network error. Please check your connection and try again."));
      }
      // Contract execution errors
      else if (error.message.includes("execution")) {
        setError(new Error("Transaction execution failed. Please check your inputs and try again."));
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
