import { useState, useEffect, useCallback } from "react";
import { RpcProvider, hash } from "starknet";
import { RANDOM_RANGE_GENERATOR_ADDRESS } from "../contracts/constants";

// RPC endpoint for Sepolia
const RPC_URL = "https://api.cartridge.gg/x/starknet/sepolia";

// Function selector for get_last_random_number
const GET_LAST_RANDOM_NUMBER_SELECTOR = hash.getSelectorFromName("get_last_random_number");

interface RandomNumberResult {
  value: number;
  min: number;
  max: number;
  generator: string;
}

/**
 * Hook for reading the last generated random number from the contract.
 * Uses direct RPC calls for reliability.
 */
export const useLastRandomNumber = (refreshTrigger?: number) => {
  const [result, setResult] = useState<RandomNumberResult | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchResult = useCallback(async () => {
    try {
      console.log("useLastRandomNumber: Fetching global last random number");
      setLoading(true);

      // Create provider
      const provider = new RpcProvider({ nodeUrl: RPC_URL });
      
      // Call the contract directly
      const response = await provider.callContract({
        contractAddress: RANDOM_RANGE_GENERATOR_ADDRESS,
        entrypoint: "get_last_random_number",
        calldata: [],
      });

      console.log("useLastRandomNumber: Raw response", response);

      // Response is an array of felt252 strings
      // [value_low, value_high, min_low, min_high, max_low, max_high, generator]
      // For u128, we only need the low part (index 0, 2, 4) since values fit in 128 bits
      // Generator is a felt252 at index 6
      
      if (response && response.length >= 4) {
        // Parse the values - they come as hex strings
        const valueBigInt = BigInt(response[0]);
        const minBigInt = BigInt(response[1]);
        const maxBigInt = BigInt(response[2]);
        const generatorBigInt = BigInt(response[3]);

        const parsedValue = Number(valueBigInt);
        const parsedMin = Number(minBigInt);
        const parsedMax = Number(maxBigInt);
        const parsedGenerator = `0x${generatorBigInt.toString(16).padStart(64, '0')}`;

        console.log("useLastRandomNumber: Parsed values", { 
          value: parsedValue, 
          min: parsedMin, 
          max: parsedMax,
          generator: parsedGenerator 
        });

        if (!parsedValue || isNaN(parsedValue)) {
          console.log("useLastRandomNumber: Value is 0 or NaN");
          setResult(null);
        } else {
          setResult({
            value: parsedValue,
            min: parsedMin,
            max: parsedMax,
            generator: parsedGenerator,
          });
        }
      } else {
        console.log("useLastRandomNumber: Invalid response format", response);
        setResult(null);
      }
    } catch (error) {
      console.error("useLastRandomNumber: Failed to fetch random number:", error);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount or refresh trigger
  useEffect(() => {
    fetchResult();
  }, [fetchResult, refreshTrigger]);

  return {
    result,
    loading,
    refetch: fetchResult,
  };
};
