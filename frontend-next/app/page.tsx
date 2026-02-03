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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                VRF Random Range Generator
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Cryptographically secure random numbers on Starknet
              </p>
            </div>
            <WalletConnect />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <p className="text-gray-700">
            This demo uses <strong>Cartridge VRF</strong> to generate verifiable random numbers
            within your specified range. Each transaction generates a unique random number that
            is cryptographically secure and verifiable on-chain.
          </p>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <strong>⚠️ Important:</strong> VRF requires <strong>Cartridge Controller</strong> wallet.
            The Cartridge Paymaster wraps your transaction with VRF proof generation
            (<code className="bg-yellow-100 px-1 py-0.5 rounded">submit_random</code> and{' '}
            <code className="bg-yellow-100 px-1 py-0.5 rounded">assert_consumed</code>).
            Standard wallets like Argent or Braavos will fail with &quot;VrfProvider: not fulfilled&quot; error.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ResultDisplay refreshTrigger={refreshTrigger} />
          <RandomNumberForm onTransactionComplete={handleTransactionComplete} />
        </div>
      </main>

      <footer className="mt-12 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-600">
            Built with Cartridge VRF on Starknet Sepolia testnet •
            <a
              href="https://github.com/cartridge-gg/cartridge_vrf"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              Documentation
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
