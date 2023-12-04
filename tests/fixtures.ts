const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config();

import "../mocks/Account.json";
import "../mocks/naming_compiled.json";
import "../mocks/starknetId_compiled.json";
import "../mocks/cairo/helloSierra/hello.json";
import "../mocks/cairo/helloSierra/hello.casm.json";
import "../mocks/cairo/account/account.json";
import "../mocks/cairo/account/account.casm.json";
import "../mocks/cairo/complexInput/complexInput.json";
import "../mocks/ERC20.json";

import {
  CompiledSierra,
  CompiledSierraCasm,
  json,
  LegacyCompiledContract,
} from "starknet";

const readContract = (name: string): LegacyCompiledContract =>
  json.parse(
    fs
      .readFileSync(path.resolve(__dirname, `../mocks/${name}.json`))
      .toString("ascii"),
  );

const readContractSierraCasm = (name: string): CompiledSierraCasm =>
  json.parse(
    fs
      .readFileSync(path.resolve(__dirname, `../mocks/${name}.casm.json`))
      .toString("ascii"),
  );

const readContractSierra = (name: string): CompiledSierra =>
  json.parse(
    fs
      .readFileSync(path.resolve(__dirname, `../mocks/${name}.json`))
      .toString("ascii"),
  );

export const compiledOpenZeppelinAccount = readContract("Account");
export const compiledErc20 = readContract("ERC20");
export const compiledStarknetId = readContract("starknetId_compiled");
export const compiledNamingContract = readContract("naming_compiled");
export const compiledHelloSierra = readContractSierra(
  "cairo/helloSierra/hello",
);
export const compiledHelloSierraCasm = readContractSierraCasm(
  "cairo/helloSierra/hello",
);
export const compiledC1Account = readContractSierra("cairo/account/account");
export const compiledC1AccountCasm = readContractSierraCasm(
  "cairo/account/account",
);
export const compiledComplexSierra = readContractSierra(
  "cairo/complexInput/complexInput",
);

const describeIf = (condition: boolean) =>
  condition ? describe : describe.skip;
export const describeIfDevnet = describeIf(
  process.env.IS_LOCALHOST_DEVNET === "true",
);
export const describeIfDevnetSequencer = describeIf(
  process.env.IS_SEQUENCER_DEVNET === "true",
);

export const erc20ClassHash =
  "0x54328a1075b8820eb43caf0caa233923148c983742402dcfc38541dd843d01a";
