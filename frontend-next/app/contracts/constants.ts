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
 * Class hash: 0x47017440b45a38020925bf7a8ba168144434361b4aac1f05e081cf03fecc7bf
 */
export const RANDOM_RANGE_GENERATOR_ADDRESS = "0x0406600b709497815218ddb7c086138a3bb9fcc0be102750f2c5c29b10a33e4a";

/**
 * Source enum for VRF randomness
 * - Nonce: Non-deterministic randomness (different for each call)
 * - Salt: Deterministic randomness (same for same input)
 */
export const Source = {
  Nonce: "0x0",
  Salt: "0x1"
} as const;
