# Phase 1 Discovery: Cairo Contract Foundation

**Research Date:** 2026-02-03
**Research Level:** Level 2 (Standard Research)
**Sources:** VRF reference repository at `/Users/akashbalasubramani/Desktop/referral/vrf/vrf/`

## VrfConsumerComponent Integration Pattern

### Component Setup (from vrf_consumer_mock.cairo lines 23-28)

```cairo
component!(path: VrfConsumerComponent, storage: vrf_consumer, event: VrfConsumerEvent);

#[abi(embed_v0)]
impl VrfConsumerImpl = VrfConsumerComponent::VrfConsumerImpl<ContractState>;

impl VrfConsumerInternalImpl = VrfConsumerComponent::InternalImpl<ContractState>;
```

**Key insights:**
- Component macro declares the component path, storage name, and event name
- Two impls required: one public (`VrfConsumerImpl`), one internal (`VrfConsumerInternalImpl`)
- `#[abi(embed_v0)]` makes component functions available in contract ABI

### Storage Configuration (lines 30-35)

```cairo
#[storage]
pub struct Storage {
    #[substorage(v0)]
    vrf_consumer: VrfConsumerComponent::Storage,
    dice_value: u8,  // Example of custom storage
}
```

**Key insights:**
- Component storage MUST use `#[substorage(v0)]` attribute
- Storage field name (`vrf_consumer`) must match component macro's storage parameter
- Custom contract storage goes alongside component substorage

### Event Configuration (lines 37-42)

```cairo
#[event]
#[derive(Drop, starknet::Event)]
pub enum Event {
    #[flat]
    VrfConsumerEvent: VrfConsumerComponent::Event,
}
```

**Key insights:**
- `#[flat]` attribute flattens component events into contract event enum
- Event variant name must match component macro's event parameter

### Constructor Pattern (lines 44-47)

```cairo
#[constructor]
fn constructor(ref self: ContractState, vrf_provider: ContractAddress) {
    self.vrf_consumer.initializer(vrf_provider);
}
```

**Key insights:**
- Constructor accepts VRF provider address (Sepolia: `0x051fea4450da9d6aee758bdeba88b2f665bcbf549d2c61421aa724e9ac0ced8f`)
- Calls `initializer()` on component (from VrfConsumerComponent::InternalImpl)
- Component validates provider address is non-zero

## consume_random API Pattern

### Function Signature (vrf_consumer_component.cairo line 63)

```cairo
fn consume_random(self: @ComponentState<TContractState>, source: Source) -> felt252
```

### Usage Example (vrf_consumer_mock.cairo lines 56-64)

```cairo
fn dice(ref self: ContractState) -> u8 {
    let player_id = get_caller_address();
    let random: u256 = self.vrf_consumer.consume_random(Source::Nonce(player_id)).into();

    let dice_value = ((random % 6) + 1).try_into().unwrap();
    self.dice_value.write(dice_value);

    dice_value
}
```

**Key insights:**
- Access via `self.vrf_consumer.consume_random()` (component's internal impl)
- Returns `felt252`, typically cast to `u256` for range operations
- `Source::Nonce(caller_address)` for non-deterministic randomness (unique per call)
- `Source::Salt(felt252)` for deterministic randomness (same salt = same random for testing)

## Required Imports

From vrf_consumer_mock.cairo lines 17-21:

```cairo
use cartridge_vrf::Source;
use cartridge_vrf::vrf_consumer::vrf_consumer_component::VrfConsumerComponent;
use stark_vrf::ecvrf::ECVRFImpl;
use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
use starknet::{ContractAddress, get_caller_address};
```

## Frontend VRF Multicall Pattern

From buildVrfCalls.ts:

### User-Facing Multicall Structure

```typescript
const requestRandomCall: Call = {
  contractAddress: vrfProviderAddress,
  entrypoint: "request_random",
  calldata: [call.contractAddress, Source.Nonce, account.address],
};

// Multicall: [requestRandomCall, userContractCall]
```

**Key insights:**
- `request_random` MUST be first in multicall
- Calldata: `[target_contract, source_type, nonce_value]`
- Source.Nonce = 0x0, Source.Salt = 0x1
- For Nonce: third param is caller address

## Common Pitfalls to Avoid

1. **Missing substorage attribute** - Component storage without `#[substorage(v0)]` causes compilation errors
2. **Missing #[flat] on events** - Events won't emit properly without flattening
3. **Wrong component storage name** - Must match `component!()` macro's storage parameter
4. **Forgetting InternalImpl** - `consume_random` is in InternalImpl, not public VrfConsumerImpl
5. **Type conversions** - `felt252 -> u256` conversion required for modulo operations

## Storage Schema for Phase 1

For `generate_random_in_range(min, max)`:

```cairo
#[storage]
pub struct Storage {
    #[substorage(v0)]
    vrf_consumer: VrfConsumerComponent::Storage,

    // Per-user last random result
    last_random: LegacyMap<ContractAddress, u128>,  // The random number
    last_min: LegacyMap<ContractAddress, u128>,     // Min of range
    last_max: LegacyMap<ContractAddress, u128>,     // Max of range
}
```

Alternative (struct-based, cleaner):

```cairo
#[derive(Drop, Serde, starknet::Store)]
struct RandomResult {
    value: u128,
    min: u128,
    max: u128,
}

#[storage]
pub struct Storage {
    #[substorage(v0)]
    vrf_consumer: VrfConsumerComponent::Storage,
    last_result: LegacyMap<ContractAddress, RandomResult>,
}
```

**Recommendation:** Use struct-based approach for cleaner storage and single map lookup.

## Event Schema

```cairo
#[derive(Drop, starknet::Event)]
struct RandomGenerated {
    caller: ContractAddress,
    value: u128,
    min: u128,
    max: u128,
}

#[event]
#[derive(Drop, starknet::Event)]
pub enum Event {
    #[flat]
    VrfConsumerEvent: VrfConsumerComponent::Event,
    RandomGenerated: RandomGenerated,
}
```

## Scarb.toml Dependencies

```toml
[dependencies]
starknet = "^2.12.1"
stark_vrf = "0.1.1"

[dependencies.cartridge_vrf]
git = "https://github.com/cartridge-gg/vrf"
```

## Files to Create

1. `contract/Scarb.toml` - Project manifest with dependencies
2. `contract/src/lib.cairo` - Main contract implementation
3. `contract/.gitignore` - Ignore build artifacts (target/)

## Phase 1 Scope

**In scope:**
- Scarb project initialization with correct dependencies
- Contract structure with VrfConsumerComponent integration
- Storage schema for last random result per user
- Event definition for RandomGenerated
- Constructor accepting VRF provider address
- Compilation verification (`scarb build`)

**Deferred to Phase 2:**
- `generate_random_in_range(min, max)` implementation
- `get_last_random_number()` getter
- Range mapping math
- consume_random integration
