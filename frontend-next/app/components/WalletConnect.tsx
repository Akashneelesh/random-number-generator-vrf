'use client'

import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { ControllerConnector } from "@cartridge/connector";

export default function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [username, setUsername] = useState<string>();

  // Get the controller connector (first connector in the array)
  const controller = connectors[0] as ControllerConnector;

  // Fetch username when connected
  useEffect(() => {
    if (!address || !controller) return;
    controller.username()?.then((name) => setUsername(name));
  }, [address, controller]);

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-4">
          <div className="text-right">
            {username && (
              <p className="text-sm font-medium text-[#39FF14]">{username}</p>
            )}
            <span className="font-mono text-xs text-gray-400">
              {truncateAddress(address)}
            </span>
          </div>
          <button
            onClick={() => disconnect()}
            className="neon-border-button px-4 py-2 rounded"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: controller })}
      disabled={isPending || !controller}
      className="neon-button px-6 py-2 rounded"
    >
      {isPending ? "CONNECTING..." : "CONNECT WALLET"}
    </button>
  );
}
