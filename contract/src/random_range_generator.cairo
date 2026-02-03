#[starknet::contract]
mod RandomRangeGenerator {
    use cartridge_vrf::Source;
    use cartridge_vrf::vrf_consumer::vrf_consumer_component::VrfConsumerComponent;
    use starknet::{ContractAddress, get_caller_address};
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    component!(path: VrfConsumerComponent, storage: vrf_consumer, event: VrfConsumerEvent);

    #[abi(embed_v0)]
    impl VrfConsumerImpl = VrfConsumerComponent::VrfConsumerImpl<ContractState>;
    impl VrfConsumerInternalImpl = VrfConsumerComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        vrf_consumer: VrfConsumerComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        VrfConsumerEvent: VrfConsumerComponent::Event,
    }

    #[constructor]
    fn constructor(ref self: ContractState, vrf_provider: ContractAddress) {
        self.vrf_consumer.initializer(vrf_provider);
    }

    #[abi(embed_v0)]
    impl RandomRangeGeneratorImpl of IRandomRangeGenerator<ContractState> {
        fn generate_random_in_range(ref self: ContractState, min: u128, max: u128) -> u128 {
            panic!("Not implemented");
        }

        fn get_last_random_number(self: @ContractState) -> (u128, u128, u128) {
            panic!("Not implemented");
        }
    }
}

#[starknet::interface]
trait IRandomRangeGenerator<TContractState> {
    fn generate_random_in_range(ref self: TContractState, min: u128, max: u128) -> u128;
    fn get_last_random_number(self: @TContractState) -> (u128, u128, u128);
}
