#[starknet::interface]
trait IRandomRangeGenerator<TContractState> {
    fn generate_random_in_range(ref self: TContractState, min: u128, max: u128) -> u128;
    fn get_last_random_number(self: @TContractState) -> (u128, u128, u128);
}

#[starknet::contract]
mod RandomRangeGenerator {
    use cartridge_vrf::vrf_consumer::vrf_consumer_component::VrfConsumerComponent;
    use cartridge_vrf::Source;
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use starknet::storage::Map;
    use starknet::storage::{StorageMapReadAccess, StorageMapWriteAccess};

    component!(path: VrfConsumerComponent, storage: vrf_consumer, event: VrfConsumerEvent);

    #[abi(embed_v0)]
    impl VrfConsumerImpl = VrfConsumerComponent::VrfConsumerImpl<ContractState>;
    impl VrfConsumerInternalImpl = VrfConsumerComponent::InternalImpl<ContractState>;

    #[derive(Drop, Serde, starknet::Store)]
    struct RandomResult {
        value: u128,
        min: u128,
        max: u128,
    }

    #[storage]
    struct Storage {
        #[substorage(v0)]
        vrf_consumer: VrfConsumerComponent::Storage,
        last_result: Map<ContractAddress, RandomResult>,
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

            // Store result for this caller
            self.last_result.write(caller, RandomResult { value, min, max });

            // Emit event
            self.emit(RandomGenerated { caller, value, min, max });

            value
        }

        fn get_last_random_number(self: @ContractState) -> (u128, u128, u128) {
            // Get caller address
            let caller = get_caller_address();

            // Read stored result for this caller
            let result = self.last_result.read(caller);

            // Return tuple (value, min, max)
            (result.value, result.min, result.max)
        }
    }
}
