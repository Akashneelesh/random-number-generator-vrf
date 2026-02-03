#[starknet::interface]
trait IRandomRangeGenerator<TContractState> {
    fn generate_random_in_range(ref self: TContractState, min: u128, max: u128) -> u128;
    fn get_last_random_number(self: @TContractState) -> (u128, u128, u128);
}

#[starknet::contract]
mod RandomRangeGenerator {
    use cartridge_vrf::vrf_consumer::vrf_consumer_component::VrfConsumerComponent;
    use starknet::ContractAddress;
    use starknet::storage::Map;

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
            core::panic_with_felt252('Not implemented');
            0
        }

        fn get_last_random_number(self: @ContractState) -> (u128, u128, u128) {
            core::panic_with_felt252('Not implemented');
            (0, 0, 0)
        }
    }
}
