import { RpcProvider, Account, Contract, cairo } from "starknet";
import { RPC_URL, SIGNER_PRIVATE, ARGENT_CONTRACT_ADDRESS } from "../constants";
import { loadContractv0 } from "../utils";

const ERC20_CONTRACT_ADDRESS =
  "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

describe("Contract Writes", () => {
  const provider = new RpcProvider({ nodeUrl: RPC_URL });
  const account0 = new Account(
    provider,
    ARGENT_CONTRACT_ADDRESS,
    SIGNER_PRIVATE,
  );

  it("estimates and transacts an ERC20 transfer", async () => {
    const RECEIVER_ADDRESS = "0x10";
    const TRANSFER_AMOUNT = 100000000000n;

    const erc20ContractData = loadContractv0(
      "../configs/genesis-assets/ERC20.json",
    );
    const erc20Instance = new Contract(
      erc20ContractData.abi,
      ERC20_CONTRACT_ADDRESS,
      provider,
    );

    erc20Instance.connect(account0);

    const preTransactSenderBalance = await erc20Instance.balanceOf(
      ARGENT_CONTRACT_ADDRESS,
    );
    const preTransactReceiverBalance =
      await erc20Instance.balanceOf(RECEIVER_ADDRESS);

    const { suggestedMaxFee: estimatedFee } = await account0.estimateInvokeFee({
      contractAddress: ERC20_CONTRACT_ADDRESS,
      entrypoint: "transfer",
      calldata: [RECEIVER_ADDRESS, cairo.uint256(TRANSFER_AMOUNT)],
    });

    const transferResponse = await erc20Instance.functions.transfer(
      RECEIVER_ADDRESS,
      cairo.uint256(TRANSFER_AMOUNT),
    );
    const receipt = await provider.waitForTransaction(
      transferResponse.transaction_hash,
    );

    expect(receipt.execution_status).toBe("SUCCEEDED");

    const decodedEvents = erc20Instance.parseEvents(receipt);
    // fetch actual fee from sequencer payment event
    const transferEventFee = decodedEvents[1].Transfer.value as any;
    expect(transferEventFee.low).toBeLessThanOrEqual(estimatedFee);

    const postTransactSenderBalance = await erc20Instance.balanceOf(
      ARGENT_CONTRACT_ADDRESS,
    );
    const postTransactReceiverBalance =
      await erc20Instance.balanceOf(RECEIVER_ADDRESS);

    expect(postTransactSenderBalance.balance.low).toBe(
      preTransactSenderBalance.balance.low -
        TRANSFER_AMOUNT -
        transferEventFee.low,
    );
    expect(postTransactReceiverBalance.balance.low).toBe(
      preTransactReceiverBalance.balance.low + TRANSFER_AMOUNT,
    );
  }, 30000);
});
