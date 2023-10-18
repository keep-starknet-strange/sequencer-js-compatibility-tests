import {
  RpcProvider,
  Account,
  Contract,
  CallData,
  cairo,
  json,
} from "starknet";
import {
  RPC_URL,
  SIGNER_PRIVATE,
  ARGENT_CONTRACT_ADDRESS,
  FEE_TOKEN_CONTRACT,
} from "../constants";
import { loadContractv0, verifyFeeEstimation } from "../utils";
const provider = new RpcProvider({ nodeUrl: RPC_URL });
const account0 = new Account(provider, ARGENT_CONTRACT_ADDRESS, SIGNER_PRIVATE);

const CLASS_HASH =
  "0x0372ee6669dc86563007245ed7343d5180b96221ce28f44408cff2898038dbd4";

describe("Deploy Genesis Contract", () => {
  const feeTokenContract = loadContractv0(
    "../configs/genesis-assets/ERC20.json",
  );
  const feeInstance = new Contract(
    feeTokenContract.abi,
    FEE_TOKEN_CONTRACT,
    provider,
  );

  it("deploys a contract and verifies fee prediction", async () => {
    // Compile call data for constructor
    let callData = new CallData(feeTokenContract.abi).compile("constructor", {
      name: "BLA",
      symbol: "TTT",
      decimals: 18,
      initial_supply: cairo.uint256(10000000000000000000),
      recipient: ARGENT_CONTRACT_ADDRESS,
    });

    // Estimate deployment fee
    const { suggestedMaxFee: estimatedFee } = await account0.estimateDeployFee({
      classHash: CLASS_HASH,
    });
    expect(estimatedFee).toBeGreaterThan(0n);

    const preTransactBalance = await feeInstance.balanceOf(
      ARGENT_CONTRACT_ADDRESS,
    );

    // Deploy the contract
    const deployResponse = await account0.deployContract({
      classHash: CLASS_HASH,
      constructorCalldata: callData,
    });

    // Wait for transaction and validate
    const receipt = await provider.waitForTransaction(
      deployResponse.transaction_hash,
    );
    expect(receipt.execution_status).toBe("SUCCEEDED");

    const postTransactBalance = await feeInstance.balanceOf(
      ARGENT_CONTRACT_ADDRESS,
    );
    verifyFeeEstimation(preTransactBalance, postTransactBalance, estimatedFee);
  }, 30000);
});
