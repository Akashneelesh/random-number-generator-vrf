import { useState, useEffect } from "react";
import type { Abi } from "starknet";
import { useAccount, useContract } from "@starknet-react/core";
import { RANDOM_RANGE_GENERATOR_ADDRESS } from "../contracts/constants";
import RandomRangeGeneratorAbiJson from "../contracts/RandomRangeGeneratorAbi.json";

const RandomRangeGeneratorAbi = RandomRangeGeneratorAbiJson as Abi;

interface RandomNumberResult {
  value: number;
  min: number;
  max: number;
}

/**
 * Hook for reading the last generated random number from the contract.
 *
 * Automatically fetches the result when the component mounts and when the
 * connected account changes. Provides manual refetch capability.
 *
 * @param refreshTrigger - Optional dependency to trigger automatic refresh
 * @returns Contract read interface with result and loading state
 *
 * @example
 * ```typescript
 * const { result, loading, refetch } = useLastRandomNumber();
 *
 * if (loading) return <div>Loading...</div>;
 * if (!result) return <div>No result yet</div>;
 * return <div>Random: {result.value}</div>;
 * ```
 */
export const useLastRandomNumber = (refreshTrigger?: number) => {
  const { account } = useAccount();
  const [result, setResult] = useState<RandomNumberResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize contract instance
  const { contract } = useContract({
    abi: RandomRangeGeneratorAbi,
    address: RANDOM_RANGE_GENERATOR_ADDRESS,
  });

  /**
   * Fetches the last random number from the contract.
   * Handles the case where no random number has been generated yet.
   */
  const fetchResult = async () => {
    if (!contract || !account) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Call contract's get_last_random_number() view function
      // Returns tuple: (value: u128, min: u128, max: u128)
      const response = await contract.get_last_random_number();

      // Parse response - response is a tuple/array
      const [value, min, max] = Array.isArray(response)
        ? response
        : [response, 0, 0];

      // Convert BigInt to number for display
      const parsedValue = Number(value);
      const parsedMin = Number(min);
      const parsedMax = Number(max);

      // If value is 0, user hasn't generated any random number yet
      if (parsedValue === 0) {
        setResult(null);
      } else {
        setResult({
          value: parsedValue,
          min: parsedMin,
          max: parsedMax,
        });
      }
    } catch (error) {
      console.error("Failed to fetch random number:", error);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount, account change, or refresh trigger
  useEffect(() => {
    fetchResult();
  }, [contract, account?.address, refreshTrigger]);

  return {
    result,
    loading,
    refetch: fetchResult,
  };
};
