import { json } from "starknet";
import * as fs from "fs";

export const loadContractv0 = (path) => {
  const contractData = fs.readFileSync(path);
  return json.parse(contractData.toString("ascii"));
};

export const loadContractv1 = (
  path: string,
  casmName: string,
  sierraName: string,
) => {
  const casm = loadContractv0(path + casmName);
  const sierra = loadContractv0(path + sierraName);
  return { casm, sierra };
};

// Ensures that the estimated fee is leq than the actual charged fee
export const verifyFeeEstimation = (
  preTransact,
  postTransact,
  estimatedFee,
) => {
  const balanceDifference = preTransact.balance.low - postTransact.balance.low;
  expect(balanceDifference).toBeLessThanOrEqual(estimatedFee);
};
