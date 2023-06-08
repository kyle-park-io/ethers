import fs from "fs";
import { ethers } from "ethers";
import { setTimeout } from "timers/promises";
import * as dotenv from "dotenv";
dotenv.config();

// Set RPC Endpoint
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");

async function api() {
  //   Get write access as an account by getting the signer
  const signer = await provider.getSigner(1);
  console.log(signer);

  const bn = await provider.getBlockNumber();
  console.log(bn);

  // Get the current balance of an account (by address or ENS name)
  const balanceWei = await provider.getBalance(signer);
  console.log(balanceWei);

  const balanceEth = ethers.formatEther(balanceWei);
  console.log(balanceEth);

  const txc = await provider.getTransactionCount(signer);
  console.log(txc);
}

// load smart contract
async function loadContract(wallet, contractName) {
  const contractJson = fs.readFileSync(
    `./config/${contractName}.contract.json`,
    function (err) {
      if (err) throw err;
    }
  );
  const parsedContract = JSON.parse(contractJson);
  const contractAddress = parsedContract.contractAddress;
  const lower = contractName.toLowerCase();
  const jsonData = fs.readFileSync(
    `./artifacts/contracts/call/${lower}.sol/${contractName}.json`,
    "utf8",
    function (err) {
      if (err) throw err;
    }
  );
  const jsonArray = JSON.parse(jsonData);
  const contract = new ethers.Contract(
    contractAddress.toString(),
    jsonArray.abi,
    wallet
  );

  return contract;
}

async function test() {
  const key = process.env.GANACHE_DEPLOYER_PRIVATE_KEY;
  const wallet = new ethers.Wallet(key, provider);
  const amount = ethers.parseEther("1");

  const a_contract = await loadContract(wallet, "A");
  const other_contract = await loadContract(wallet, "Other");

  let a_balance;
  let other_balance;

  await a_contract.setBalance(amount);
  a_balance = await a_contract.getBalance();
  console.log("a balance : ", a_balance);

  await setTimeout(5000);

  await other_contract.setBalance(amount);
  other_balance = await other_contract.getBalance();
  console.log("other balance : ", other_balance);

  await setTimeout(5000);

  // static call example
  const other_balance_staticcall = await a_contract.getOtherBalance();
  console.log("other balance : ", other_balance_staticcall);

  await setTimeout(5000);

  // call example
  other_balance = await other_contract.getBalance();
  console.log("other balance : ", other_balance);
  await a_contract.setOtherBalance(amount);
  other_balance = await other_contract.getBalance();
  console.log("other balance : ", other_balance);

  await setTimeout(5000);

  // delegate call example
  a_balance = await a_contract.getBalance();
  console.log("a balance : ", a_balance);
  other_balance = await other_contract.getBalance();
  console.log("other balance : ", other_balance);
  await a_contract.setBalanceDelegate(amount);
  a_balance = await a_contract.getBalance();
  console.log("a balance : ", a_balance);
  other_balance = await other_contract.getBalance();
  console.log("other balance : ", other_balance);
}

async function main() {
  test();
}

main();
