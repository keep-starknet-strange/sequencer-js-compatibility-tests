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
import { loadContractv0, loadContractv1, verifyFeeEstimation } from "../utils";

const provider = new RpcProvider({ nodeUrl: RPC_URL });
const account0 = new Account(provider, ARGENT_CONTRACT_ADDRESS, SIGNER_PRIVATE);
const feeTokenContract = loadContractv0("../configs/genesis-assets/ERC20.json");

describe("Starknet Contract Operations", () => {
  describe("Declare & Deploy Cairo v0 Contracts", () => {
    const braavosAccountContract = loadContractv0(
      "../cairo-contracts/build/BraavosAccount.json",
    );
    const CLASS_HASH =
      "0x63e86077e88ec9a2ce9fbf33c3d50a0759abdd1664c8cd7d756310b2a158bef";

    it("declares a v0 contract", async () => {
      const feeInstance = new Contract(
        feeTokenContract.abi,
        FEE_TOKEN_CONTRACT,
        provider,
      );

      // Estimate and verify declaration fee
      const { suggestedMaxFee: estimatedFee } =
        await account0.estimateDeclareFee({
          contract: braavosAccountContract,
          classHash: CLASS_HASH,
        });
      expect(estimatedFee).toBeGreaterThan(0n);

      const preTransactBalance = await feeInstance.balanceOf(
        ARGENT_CONTRACT_ADDRESS,
      );
      const declareResponse = await account0.declare({
        contract: braavosAccountContract,
      });

      // Assert successful declaration
      expect(declareResponse.class_hash).toBe(CLASS_HASH);
      await provider.waitForTransaction(declareResponse.transaction_hash);

      const postTransactBalance = await feeInstance.balanceOf(
        ARGENT_CONTRACT_ADDRESS,
      );
      await verifyFeeEstimation(
        preTransactBalance,
        postTransactBalance,
        estimatedFee,
      );

      const declaredContract = await provider.getClass(
        declareResponse.class_hash,
      );
      expect(declaredContract.entry_points_by_type).toBeDefined();
    }, 60000);

    it("deploys v0 contract", async () => {
      const feeInstance = new Contract(
        feeTokenContract.abi,
        FEE_TOKEN_CONTRACT,
        provider,
      );
      const callData = new CallData(braavosAccountContract.abi).compile(
        "constructor",
        { public_key: ARGENT_CONTRACT_ADDRESS },
      );

      // Estimate and verify deployment fee
      const { suggestedMaxFee: estimatedFee } =
        await account0.estimateDeployFee({ classHash: CLASS_HASH });
      expect(estimatedFee).toBeGreaterThan(0n);

      const preTransact = await feeInstance.balanceOf(ARGENT_CONTRACT_ADDRESS);
      const deployResponse = await account0.deployContract({
        classHash: CLASS_HASH,
        constructorCalldata: callData,
      });

      // Assert successful deployment
      const receipt = await provider.waitForTransaction(
        deployResponse.transaction_hash,
      );
      expect(receipt.execution_status).toBe("SUCCEEDED");

      const postTransact = await feeInstance.balanceOf(ARGENT_CONTRACT_ADDRESS);
      await verifyFeeEstimation(preTransact, postTransact, estimatedFee);
    }, 60000);
  });

  describe("Declare & Deploy Cairo v1 Contracts", () => {
    const { casm, sierra } = loadContractv1(
      "../cairo-contracts/build/cairo_1/",
      "HelloStarknet.casm.json",
      "HelloStarknet.sierra.json",
    );
    const CLASS_HASH =
      "0x9cf5ef6166edaa87767d05bbfd54ad02fd110028597343a200e82949ce05cf";

    it("declares a v1 contract", async () => {
      const feeInstance = new Contract(
        feeTokenContract.abi,
        FEE_TOKEN_CONTRACT,
        provider,
      );

      // Estimate and verify declaration fee
      const { suggestedMaxFee: estimatedFee } =
        await account0.estimateDeclareFee({
          contract: sierra,
          casm: casm,
          classHash: CLASS_HASH,
        });
      expect(estimatedFee).toBeGreaterThan(0n);

      const preTransactBalance = await feeInstance.balanceOf(
        ARGENT_CONTRACT_ADDRESS,
      );
      const declareResponse = await account0.declare({
        contract: sierra,
        casm: casm,
      });

      // Assert successful declaration
      const receipt = await provider.waitForTransaction(
        declareResponse.transaction_hash,
      );
      expect(receipt.execution_status).toBe("SUCCEEDED");

      const postTransactBalance = await feeInstance.balanceOf(
        ARGENT_CONTRACT_ADDRESS,
      );
      await verifyFeeEstimation(
        preTransactBalance,
        postTransactBalance,
        estimatedFee,
      );

      expect(declareResponse.class_hash).toBe(CLASS_HASH);

      const declaredContract = await provider.getClass(
        declareResponse.class_hash,
      );
      expect(declaredContract.entry_points_by_type).toBeDefined();
    }, 60000);

    it("deploys v1 contract", async () => {
      const feeInstance = new Contract(
        feeTokenContract.abi,
        FEE_TOKEN_CONTRACT,
        provider,
      );

      // Estimate and verify deployment fee
      const { suggestedMaxFee: estimatedFee } =
        await account0.estimateDeployFee({ classHash: CLASS_HASH });
      expect(estimatedFee).toBeGreaterThan(0n);

      const preTransact = await feeInstance.balanceOf(ARGENT_CONTRACT_ADDRESS);
      const deployResponse = await account0.deployContract({
        classHash: CLASS_HASH,
      });

      // Assert successful deployment
      const receipt = await provider.waitForTransaction(
        deployResponse.transaction_hash,
      );
      expect(receipt.execution_status).toBe("SUCCEEDED");

      const postTransact = await feeInstance.balanceOf(ARGENT_CONTRACT_ADDRESS);
      await verifyFeeEstimation(preTransact, postTransact, estimatedFee);
    }, 60000);
  });
});
