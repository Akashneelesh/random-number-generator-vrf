/**
 * VRF contract constants and configuration
 */

/**
 * VRF Provider address on Starknet Sepolia testnet
 * This is the Cartridge VRF provider that handles randomness proofs
 */
export const VRF_PROVIDER_ADDRESS = "0x051fea4450da9d6aee758bdeba88b2f665bcbf549d2c61421aa724e9ac0ced8f";

/**
 * RandomRangeGenerator contract address on Starknet Sepolia testnet
 * Deployed in Phase 4 Plan 1
 */
export const RANDOM_RANGE_GENERATOR_ADDRESS = "0x07ba8f7f7b1d7b2f7a3f9f998c373a71bc02f56c20cd2df4d2fe716076ffa8d9";

/**
 * Source enum for VRF randomness
 * - Nonce: Non-deterministic randomness (different for each call)
 * - Salt: Deterministic randomness (same for same input)
 */
export const Source = {
  Nonce: "0x0",
  Salt: "0x1"
} as const;
