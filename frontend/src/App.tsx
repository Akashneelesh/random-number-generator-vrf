import { useState } from 'react'
import './App.css'
import WalletConnect from './components/WalletConnect'
import ResultDisplay from './components/ResultDisplay'
import RandomNumberForm from './components/RandomNumberForm'

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Trigger result refresh when transaction completes
  const handleTransactionComplete = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1 className="app-title">VRF Random Range Generator</h1>
            <p className="app-subtitle">Cryptographically secure random numbers on Starknet</p>
          </div>
          <WalletConnect />
        </div>
      </header>

      <main className="app-main">
        <div className="info-banner">
          <p>
            This demo uses <strong>Cartridge VRF</strong> to generate verifiable random numbers
            within your specified range. Each transaction generates a unique random number that
            is cryptographically secure and verifiable on-chain.
          </p>
        </div>

        <div className="components-grid">
          <ResultDisplay refreshTrigger={refreshTrigger} />
          <RandomNumberForm onTransactionComplete={handleTransactionComplete} />
        </div>
      </main>

      <footer className="app-footer">
        <p>
          Built with Cartridge VRF on Starknet Sepolia testnet •
          <a
            href="https://github.com/cartridge-gg/cartridge_vrf"
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginLeft: '0.5rem' }}
          >
            Documentation
          </a>
        </p>
      </footer>
    </div>
  )
}

export default App
