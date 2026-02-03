import type { Call } from "starknet";
import { CallData } from "starknet";
import { Source, VRF_PROVIDER_ADDRESS } from "../contracts/constants";

/**
 * Builds a VRF multicall array for Starknet transactions.
 *
 * This function creates the proper two-call sequence required for VRF operations:
 * 1. request_random - Signals VRF request to the paymaster (no-op marker)
 * 2. Target contract call - The actual contract function that consumes randomness
 *
 * Transaction Flow:
 * - User sends: [request_random, generate_random_in_range]
 * - Paymaster automatically wraps with VRF proof: [submit_random, request_random, generate_random_in_range, assert_consumed]
 * - submit_random: Verifies VRF proof and stores random value (paymaster handles)
 * - request_random: No-op marker for paymaster to detect VRF usage
 * - generate_random_in_range: Contract calls consume_random internally
 * - assert_consumed: Validates randomness was used exactly once (paymaster handles)
 *
 * @param params - Parameters for building the VRF calls
 * @param params.contractAddress - Address of the target contract (e.g., RandomRangeGenerator)
 * @param params.accountAddress - Address of the user's wallet/account (caller)
 * @param params.entrypoint - Function name to call on the target contract
 * @param params.calldata - Arguments for the target contract function
 * @returns Array of Call objects for account.execute()
 *
 * @example
 * ```typescript
 * const calls = buildVrfCalls({
 *   contractAddress: RANDOM_RANGE_GENERATOR_ADDRESS,
 *   accountAddress: account.address,
 *   entrypoint: "generate_random_in_range",
 *   calldata: [1000, 1300]
 * });
 * await account.execute(calls);
 * ```
 */
export const buildVrfCalls = ({
  contractAddress,
  accountAddress,
  entrypoint,
  calldata,
}: {
  contractAddress: string;
  accountAddress: string;
  entrypoint: string;
  calldata: any[];
}): Call[] => {
  /**
   * Call 1: request_random
   * Signals to the VRF provider that randomness is needed
   * Calldata: [contractAddress, Source.Nonce, accountAddress]
   * - contractAddress: Target contract that will consume randomness
   * - Source.Nonce (0x0): Non-deterministic randomness unique per user transaction
   * - accountAddress: Caller's wallet address for nonce calculation
   */
  const requestRandomCall: Call = {
    contractAddress: VRF_PROVIDER_ADDRESS,
    entrypoint: "request_random",
    calldata: CallData.compile([contractAddress, Source.Nonce, accountAddress]),
  };

  /**
   * Call 2: Target contract function
   * The actual contract call that will consume the randomness
   * The contract must call consume_random() internally during execution
   */
  const targetCall: Call = {
    contractAddress,
    entrypoint,
    calldata,
  };

  // Return the two-call sequence
  // Paymaster will automatically wrap this with submit_random and assert_consumed
  return [requestRandomCall, targetCall];
};
