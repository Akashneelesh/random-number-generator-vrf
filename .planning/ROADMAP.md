# Roadmap: VRF Random Range Generator

## Overview

This roadmap takes the VRF Random Range Generator from initial setup to a working reference implementation deployed on Sepolia testnet. We start by establishing the Cairo smart contract foundation with VrfConsumerComponent integration, implement the core random range generation logic with proper mathematical distribution, build a React frontend with wallet integration and VRF multicall patterns, and finally deploy and verify the complete end-to-end workflow. Each phase delivers a complete, verifiable capability that builds toward a clean, correct, and complete reference template for future VRF-enabled projects.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Cairo Contract Foundation** - Set up smart contract with VrfConsumerComponent integration and storage
- [x] **Phase 2: Random Range Generation** - Implement random number generation with accurate range mapping
- [x] **Phase 3: Frontend Integration** - Build React UI with wallet connection and VRF transaction flow
- [ ] **Phase 4: Deployment & Verification** - Deploy to Sepolia testnet and validate complete workflow

## Phase Details

### Phase 1: Cairo Contract Foundation
**Goal**: Establish Cairo smart contract structure with VrfConsumerComponent properly initialized, substorage configured, and storage schema defined for tracking user randomness results.
**Depends on**: Nothing (first phase)
**Research**: Likely (new VRF component integration)
**Research topics**: VrfConsumerComponent initialization patterns from reference repo, substorage setup, component integration best practices
**Status**: Complete
**Completed**: 2026-02-03

Plans:
- [x] 01-01: Cairo Contract Foundation (45 min)

### Phase 2: Random Range Generation
**Goal**: Implement `generate_random_in_range(min, max)` function with consume_random integration, mathematically sound uniform distribution mapping, and proper event emission.
**Depends on**: Phase 1
**Research**: Likely (VRF consumption pattern + range mapping math)
**Research topics**: consume_random API usage, uniform distribution with modulo (avoiding bias), u128/u256 type handling in Cairo, getter function patterns
**Status**: Complete
**Completed**: 2026-02-03

Plans:
- [x] 02-01: Random Range Generation (30 min)

### Phase 3: Frontend Integration
**Goal**: Build React TypeScript frontend with Starknet wallet connection, VRF multicall builder (request_random → generate_random_in_range), transaction execution with loading states, and result display.
**Depends on**: Phase 2
**Research**: Likely (VRF multicall pattern)
**Research topics**: buildVrfCalls structure from reference repo, @starknet-react/core wallet setup, Source::Nonce encoding, multicall execution patterns, contract ABI integration
**Status**: Complete
**Completed**: 2026-02-03
**Plans**: 3 total

Plans:
- [x] 03-01: Frontend Setup & Wallet Integration (10 min)
- [x] 03-02: VRF Multicall Implementation (15 min)
- [x] 03-03: UI Components & Result Display (48 min)

### Phase 4: Deployment & Verification
**Goal**: Deploy contract to Sepolia testnet with VRF provider address configured, update frontend constants, execute complete transaction flow, and document setup/testing instructions.
**Depends on**: Phase 3
**Research**: Unlikely (standard Starknet deployment process)
**Plans**: TBD

Plans:
- [ ] TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Cairo Contract Foundation | 1/1 | Complete | 2026-02-03 |
| 2. Random Range Generation | 1/1 | Complete | 2026-02-03 |
| 3. Frontend Integration | 3/3 | Complete | 2026-02-03 |
| 4. Deployment & Verification | 0/TBD | Not started | - |
