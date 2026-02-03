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
              <p className="text-sm font-medium">{username}</p>
            )}
            <span className="font-mono text-xs text-gray-500">
              {truncateAddress(address)}
            </span>
          </div>
          <button
            onClick={() => disconnect()}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
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
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
    >
      {isPending ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
