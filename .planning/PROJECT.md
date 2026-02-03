# VRF Random Range Generator

## What This Is

A reference implementation for integrating Cartridge VRF on Starknet. Consists of a Cairo smart contract that generates cryptographically secure random numbers within user-specified ranges (e.g., 1000-1300) and a React + TypeScript frontend for interaction. Deployed on Sepolia testnet as a reusable template for future VRF-enabled projects.

## Core Value

Clean, correct, complete reference implementation. All aspects matter equally: exemplary VRF integration patterns, mathematically sound range mapping, well-documented code, and fully working end-to-end flow. This is the template others (and you) will copy from.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Cairo smart contract with VrfConsumerComponent integration
  - Proper component initialization and substorage setup
  - `generate_random_in_range(min, max)` function using `consume_random`
  - Storage for last result per user (address → number, min, max)
  - `get_last_random_number()` getter function
  - Event emission on random generation
- [ ] React + TypeScript frontend with wallet integration
  - Starknet wallet connection (Argent X, Braavos via @starknet-react/core)
  - Input validation for range (min < max)
  - VRF multicall builder (`request_random` → `generate_random_in_range`)
  - Transaction execution with loading states
  - Result display fetched via contract read
- [ ] Correct VRF multicall pattern
  - `request_random` call MUST be first in multicall
  - Proper `Source::Nonce(caller)` encoding
  - Contract calls `consume_random` during execution
  - Atomic randomness guarantee per transaction
- [ ] Accurate random range mapping
  - Uniform distribution: `min + (random % (max - min + 1))`
  - No modulo bias for reasonable ranges
  - Proper u128/u256 type handling
- [ ] Deployment to Sepolia testnet
  - Contract deployed with VRF provider address (0x051fea...)
  - Contract address configured in frontend constants
  - Verified working transaction flow on testnet
- [ ] Clean, documented code structure
  - Clear separation: contract/, frontend/
  - Reusable helpers (vrfHelpers.ts, useVrfTransaction hook)
  - Comments explaining VRF-specific patterns
  - README with setup and testing instructions

### Out of Scope

- Batch random generation — Keep it simple, one random number per transaction for clarity
- History tracking system — Only store last result per user, not full history
- Admin functions or access control — Reference implementation focuses on core VRF usage
- Production optimizations — Gas optimization, advanced error recovery deferred to production use cases
- Source::Salt implementation — Only Source::Nonce for non-deterministic randomness
- Mainnet deployment — Testnet only for reference template

## Context

### VRF Reference Repository
Located at `/Users/akashbalasubramani/Desktop/referral/vrf/vrf/` with critical reference files:
- `src/vrf_consumer/vrf_consumer_component.cairo` - Component initializer and consume_random function
- `src/mocks/vrf_consumer_mock.cairo` - Integration pattern (lines 23-28, 56-64 show dice() example)
- `dojo/buildVrfCalls.ts` - Multicall structure for VRF transactions
- `README.md` - VRF provider addresses, transaction flow, requirements

### Cartridge VRF Transaction Flow
User multicall: `[request_random, generate_random_in_range]`
Paymaster wraps: `[submit_random, request_random, generate_random_in_range, assert_consumed]`
- `submit_random` verifies VRF proof, stores random value
- `request_random` signals VRF request (no-op marker)
- Contract's `generate_random_in_range` calls `consume_random` internally
- `assert_consumed` validates random was used exactly once

### Technical Environment
- Cairo smart contracts with Scarb build system
- Starknet Sepolia testnet (no mainnet deployment planned)
- Modern React + Vite frontend stack
- Starknet React library for wallet/contract interaction

## Constraints

- **Network**: Starknet Sepolia Testnet only — Reference template doesn't need mainnet deployment
- **VRF Provider**: 0x051fea4450da9d6aee758bdeba88b2f665bcbf549d2c61421aa724e9ac0ced8f — Sepolia VRF provider address (hardcoded)
- **Tech Stack**: Cairo 2.12.1+, React 18, TypeScript, Vite — Modern tooling for reference quality
- **Dependencies**:
  - Cairo: starknet ^2.12.1, cartridge_vrf (git), stark_vrf 0.1.1
  - Frontend: starknet ^6.11.0, @starknet-react/core ^3.5.0, get-starknet ^3.3.0
- **Pattern Fidelity**: Must follow VrfConsumerComponent patterns from reference repository — Ensures correctness
- **Testnet ETH**: Required for transactions — Users need Sepolia ETH from faucet

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Source::Nonce over Source::Salt | Non-deterministic randomness is the common use case; each call generates unique random | — Pending |
| Storage per user address | Simple pattern for reference template; real apps can extend to more complex storage | — Pending |
| Minimal error handling in v1 | Focus on happy path; production implementations will add robustness | — Pending |
| Vite over CRA | Faster dev experience, modern tooling, better for reference template | — Pending |

---
*Last updated: 2026-02-03 after initialization*
