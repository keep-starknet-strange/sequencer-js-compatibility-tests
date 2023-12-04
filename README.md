# Sequencer Compatibility JS Tests

This repo defines a full test suite written in Javascript that can be used to test any starknet sequencer.

⚠️ This is still work in progress and should not be used in production ⚠️

## Config

The default configuration works for Madara, you can try by running locally a madara node using

```bash
./target/release/madara 
./target/release/madara --dev
```

```typescript
export const RPC_URL = "http://127.0.0.1:9944";
export const SIGNER_PUBLIC =
  "0x3603a2692a2ae60abb343e832ee53b55d6b25f02a3ef1565ec691edc7a209b2";
export const SIGNER_PRIVATE =
  "0x00c1cf1490de1352865301bb8705143f3ef938f97fdf892f1090dcb5ac7bcd1d";
export const ARGENT_CONTRACT_ADDRESS = "0x02";
export const FEE_TOKEN_CONTRACT =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
```

## Github Action

This repo can be used directly as a github action and is currently being used in Madara to ensure its compatibility with existing tooling.