import { Account, RpcProvider, CallData, constants, Signer } from 'starknet';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const SEPOLIA_RPC = 'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_10/iK7ogImR5B8hKI4X43AQh';
const ACCOUNT_ADDRESS = '0x02538a3ebb0a977045dc2336522803de5be5fbe2505a9feb93c0b445fee42e0e';
const PRIVATE_KEY = "0x063a6e09a22310a57922916aaae10aec4c90be947ef8410da9a722066c15a0e6";
const VRF_PROVIDER_ADDRESS = '0x051fea4450da9d6aee758bdeba88b2f665bcbf549d2c61421aa724e9ac0ced8f';

if (!PRIVATE_KEY) {
  console.error('Error: STARKNET_PRIVATE_KEY environment variable is required');
  process.exit(1);
}

async function main() {
  console.log('🚀 Starting contract deployment...\n');

  // Initialize provider
  const provider = new RpcProvider({
    nodeUrl: SEPOLIA_RPC,
    chainId: constants.StarknetChainId.SN_SEPOLIA,
  });

  // Create signer from private key
  const signer = new Signer(PRIVATE_KEY);

  // Initialize account - v9 with signer
  const account = new Account({
    provider,
    address: ACCOUNT_ADDRESS,
    signer,
  });
  

  console.log('Account:', ACCOUNT_ADDRESS);
  console.log('Network:', SEPOLIA_RPC, '\n');

  // Read compiled contract files
  const sierraPath = path.join(__dirname, 'target/dev/vrf_random_range_RandomRangeGenerator.contract_class.json');
  const casmPath = path.join(__dirname, 'target/dev/vrf_random_range_RandomRangeGenerator.compiled_contract_class.json');

  const sierraContract = JSON.parse(fs.readFileSync(sierraPath, 'utf8'));
  const casmContract = JSON.parse(fs.readFileSync(casmPath, 'utf8'));

  console.log('📝 Step 1: Declaring contract class...');

  try {
    // Declare contract
    const declareResponse = await account.declareIfNot({
      contract: sierraContract,
      casm: casmContract,
    });

    const classHash = declareResponse.class_hash;
    console.log('✅ Contract declared!');
    console.log('   Class hash:', classHash);
    if (declareResponse.transaction_hash) {
      console.log('   Transaction:', declareResponse.transaction_hash);
      await provider.waitForTransaction(declareResponse.transaction_hash);
    } else {
      console.log('   (Class already declared)');
    }
    console.log('');

    console.log('📝 Step 2: Deploying contract instance...');

    // Deploy contract with VRF provider address as constructor argument
    const { transaction_hash: deployTxHash, contract_address } = await account.deployContract({
      classHash: classHash,
      constructorCalldata: [VRF_PROVIDER_ADDRESS],
    });

    console.log('   Waiting for transaction...');
    await provider.waitForTransaction(deployTxHash);

    console.log('✅ Contract deployed!');
    console.log('   Contract address:', contract_address[0]);
    console.log('   Transaction:', deployTxHash, '\n');

    console.log('🎉 Deployment complete!\n');
    console.log('Summary:');
    console.log('  Class hash:', classHash);
    console.log('  Contract address:', contract_address[0]);
    console.log('  VRF Provider:', VRF_PROVIDER_ADDRESS);
  } catch (error) {
    console.error('Deployment failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
