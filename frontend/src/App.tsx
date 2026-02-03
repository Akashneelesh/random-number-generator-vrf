import './App.css'
import WalletConnect from './components/WalletConnect'

function App() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
        <h1>VRF Random Range Generator</h1>
        <WalletConnect />
      </div>
    </div>
  )
}

export default App
