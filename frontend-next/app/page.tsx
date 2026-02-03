'use client'

import { useState } from 'react'
import WalletConnect from './components/WalletConnect'
import ResultDisplay from './components/ResultDisplay'
import RandomNumberForm from './components/RandomNumberForm'

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleTransactionComplete = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-[#39FF14]/30">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white glow-text">
                VRF RANDOM GENERATOR
              </h1>
              <p className="mt-1 text-sm text-[#39FF14]">
                Cryptographically secure random numbers on Starknet
              </p>
            </div>
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Info Banner */}
        <div className="cyber-card p-6 mb-8">
          <p className="text-gray-300">
            This demo uses <span className="text-[#39FF14] font-semibold">Cartridge VRF</span> to generate verifiable random numbers
            within your specified range. Each transaction generates a unique random number that
            is cryptographically secure and verifiable on-chain.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ResultDisplay refreshTrigger={refreshTrigger} />
          <RandomNumberForm onTransactionComplete={handleTransactionComplete} />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-[#39FF14]/30">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Built with <span className="text-[#39FF14]">Cartridge VRF</span> on Starknet Sepolia testnet •
            <a
              href="https://github.com/cartridge-gg/cartridge_vrf"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-[#39FF14] hover:underline"
            >
              Documentation
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
