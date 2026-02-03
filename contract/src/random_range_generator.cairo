#[starknet::interface]
trait IRandomRangeGenerator<TContractState> {
    fn generate_random_in_range(ref self: TContractState, min: u128, max: u128) -> u128;
    fn get_last_random_number(self: @TContractState) -> (u128, u128, u128, ContractAddress);
}

use starknet::ContractAddress;

#[starknet::contract]
mod RandomRangeGenerator {
    use cartridge_vrf::vrf_consumer::vrf_consumer_component::VrfConsumerComponent;
    use cartridge_vrf::Source;
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    component!(path: VrfConsumerComponent, storage: vrf_consumer, event: VrfConsumerEvent);

    #[abi(embed_v0)]
    impl VrfConsumerImpl = VrfConsumerComponent::VrfConsumerImpl<ContractState>;
    impl VrfConsumerInternalImpl = VrfConsumerComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        vrf_consumer: VrfConsumerComponent::Storage,
        // Global last result - same for everyone
        last_value: u128,
        last_min: u128,
        last_max: u128,
        last_generator: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct RandomGenerated {
        caller: ContractAddress,
        value: u128,
        min: u128,
        max: u128,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        VrfConsumerEvent: VrfConsumerComponent::Event,
        RandomGenerated: RandomGenerated,
    }

    #[constructor]
    fn constructor(ref self: ContractState, vrf_provider: ContractAddress) {
        self.vrf_consumer.initializer(vrf_provider);
    }

    #[abi(embed_v0)]
    impl RandomRangeGeneratorImpl of super::IRandomRangeGenerator<ContractState> {
        fn generate_random_in_range(ref self: ContractState, min: u128, max: u128) -> u128 {
            // Get caller address
            let caller = get_caller_address();

            // Validate range: min must be less than max
            assert!(min < max, "min must be less than max");

            // Consume random from VRF using caller's nonce as source
            let random: u256 = self.vrf_consumer.consume_random(Source::Nonce(caller)).into();

            // Apply uniform distribution: min + (random % (max - min + 1))
            let range_size: u256 = (max - min + 1).into();
            let offset = random % range_size;
            let value: u128 = (min.into() + offset).try_into().unwrap();

            // Store result globally (visible to everyone)
            self.last_value.write(value);
            self.last_min.write(min);
            self.last_max.write(max);
            self.last_generator.write(caller);

            // Emit event
            self.emit(RandomGenerated { caller, value, min, max });

            value
        }

        fn get_last_random_number(self: @ContractState) -> (u128, u128, u128, ContractAddress) {
            // Read global last result (same for all callers)
            let value = self.last_value.read();
            let min = self.last_min.read();
            let max = self.last_max.read();
            let generator = self.last_generator.read();

            // Return tuple (value, min, max, generator)
            (value, min, max, generator)
        }
    }
}
