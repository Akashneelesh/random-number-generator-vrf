'use client'

import { sepolia } from "@starknet-react/chains";
import {
  StarknetConfig,
  jsonRpcProvider,
  voyager,
} from "@starknet-react/core";
import { ControllerConnector } from "@cartridge/connector";
import type { SessionPolicies } from "@cartridge/controller";

/**
 * StarknetProvider with Cartridge Controller for VRF support
 * 
 * The Cartridge Controller is REQUIRED for VRF transactions because:
 * 1. The Cartridge Paymaster intercepts transactions with request_random
 * 2. It generates the VRF proof and wraps the transaction with submit_random
 * 3. Without this, the VRF provider has no random value stored -> "not fulfilled" error
 */

// Contract addresses
const VRF_PROVIDER_ADDRESS = "0x051fea4450da9d6aee758bdeba88b2f665bcbf549d2c61421aa724e9ac0ced8f";
const RANDOM_RANGE_GENERATOR_ADDRESS = "0x0406600b709497815218ddb7c086138a3bb9fcc0be102750f2c5c29b10a33e4a";

// VRF session policies
const policies: SessionPolicies = {
  contracts: {
    [VRF_PROVIDER_ADDRESS]: {
      methods: [{ name: "Request Random", entrypoint: "request_random" }],
    },
    [RANDOM_RANGE_GENERATOR_ADDRESS]: {
      methods: [{ name: "Generate Random in Range", entrypoint: "generate_random_in_range" }],
    },
  },
};

// ⚠️ IMPORTANT: ControllerConnector must be created OUTSIDE of React components
// Creating it inside a component will cause recreation on every render
const connector = new ControllerConnector({
  policies,
  chains: [
    { rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia" },
  ],
});

// Configure RPC provider for Sepolia
const provider = jsonRpcProvider({
  rpc: () => ({
    nodeUrl: "https://api.cartridge.gg/x/starknet/sepolia",
  }),
});

export default function StarknetProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StarknetConfig
      autoConnect
      chains={[sepolia]}
      defaultChainId={sepolia.id}
      provider={provider}
      connectors={[connector]}
      explorer={voyager}
    >
      {children}
    </StarknetConfig>
  );
}
