import { RpcProvider, Contract, shortString } from "starknet";
import { RPC_URL, SIGNER_PUBLIC, ARGENT_CONTRACT_ADDRESS } from "../constants";

import { loadContractv0 } from "../utils";

const provider = new RpcProvider({ nodeUrl: RPC_URL });

describe("Contract Reads", () => {
  describe("ArgentAccount", () => {
    let instance;

    beforeEach(() => {
      const argentContract = loadContractv0(
        "../cairo-contracts/build/ArgentAccount.json",
      );
      instance = new Contract(
        argentContract.abi,
        ARGENT_CONTRACT_ADDRESS,
        provider,
      );
    });

    it("reads and decodes name", async () => {
      const encodedName = await instance.getName();
      expect(shortString.decodeShortString(encodedName.name)).toBe(
        "ArgentAccount",
      );
    });

    it("reads and decodes signer", async () => {
      const encodedSigner = await instance.getSigner();
      expect("0x" + encodedSigner.signer.toString(16)).toBe(SIGNER_PUBLIC);
    });
  });

  describe("ERC20", () => {
    let instance;

    beforeEach(() => {
      const erc20Contract = loadContractv0(
        "../configs/genesis-assets/ERC20.json",
      );
      instance = new Contract(
        erc20Contract.abi,
        "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        provider,
      );
    });

    it("reads and decodes balance", async () => {
      const balanceEncoded = await instance.balanceOf("0x02");
      expect(balanceEncoded.balance.low).toBeGreaterThan(0n);
      expect(balanceEncoded.balance.high.toString(16)).toBe(
        "ffffffffffffffffffffffffffffffff",
      );
    });

    it("reads other variables", async () => {
      // genesis is deployed without a name, symbol or decimals
      expect((await instance.name()).name).toBe(298305742194n);
      expect((await instance.decimals()).decimals).toBe(18n);
      expect((await instance.symbol()).symbol).toBe(4543560n);

      // the total supply is wrong, as the balance was set via state update
      const totalSupplyEncoded = await instance.totalSupply();
      expect(totalSupplyEncoded.totalSupply.low).toBe(0n);
      expect(totalSupplyEncoded.totalSupply.high).toBe(0n);
    });
  });

  describe("Chain Info via provider", () => {
    it("reads genesis block", async () => {
      const genesisBlock = await provider.getBlock(0);
      expect(genesisBlock.block_number).toBe(0);
      expect(genesisBlock.parent_hash).toBe("0x0");
    });

    it("reads declared contract", async () => {
      const declaredContract = await provider.getClass(
        "0x0372ee6669dc86563007245ed7343d5180b96221ce28f44408cff2898038dbd4",
      );
      expect(declaredContract.entry_points_by_type).toBeDefined();
    });

    it("reads deployed contract", async () => {
      const deployedContract = await provider.getClassAt(
        "0x040e59c2c182a58fb0a74349bfa4769cbbcba32547591dd3fb1def8623997d00",
      );
      expect(deployedContract.entry_points_by_type).toBeDefined();
    });

    it("reads storage", async () => {
      const storageRead = await provider.getStorageAt(
        "0x040e59c2c182a58fb0a74349bfa4769cbbcba32547591dd3fb1def8623997d00",
        "0x7b62949c85c6af8a50c11c22927f9302f7a2e40bc93b4c988415915b0f97f0a",
      );
      expect(storageRead).toBe("0xffffffffffffffffffffffffffffffff");
    });
  });
});
