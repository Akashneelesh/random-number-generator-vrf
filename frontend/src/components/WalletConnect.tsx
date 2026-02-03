import { useConnect, useDisconnect, useAccount } from "@starknet-react/core";
import { useState } from "react";

export default function WalletConnect() {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const [showConnectors, setShowConnectors] = useState(false);

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span style={{ fontFamily: "monospace" }}>
          {truncateAddress(address)}
        </span>
        <button
          onClick={() => disconnect()}
          style={{
            padding: "0.5rem 1rem",
            border: "1px solid #646cff",
            borderRadius: "0.25rem",
            backgroundColor: "transparent",
            color: "#646cff",
            cursor: "pointer",
          }}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setShowConnectors(!showConnectors)}
        style={{
          padding: "0.5rem 1rem",
          border: "1px solid #646cff",
          borderRadius: "0.25rem",
          backgroundColor: "#646cff",
          color: "white",
          cursor: "pointer",
        }}
      >
        Connect Wallet
      </button>

      {showConnectors && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: "0.5rem",
            padding: "0.5rem",
            border: "1px solid #646cff",
            borderRadius: "0.25rem",
            backgroundColor: "white",
            color: "black",
            minWidth: "200px",
            zIndex: 1000,
          }}
        >
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => {
                connect({ connector });
                setShowConnectors(false);
              }}
              style={{
                display: "block",
                width: "100%",
                padding: "0.5rem",
                border: "none",
                backgroundColor: "transparent",
                textAlign: "left",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f0f0f0")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              {connector.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
