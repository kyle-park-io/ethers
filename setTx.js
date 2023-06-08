import fs from "fs";
import { ethers } from "ethers";

let contract;

// Set RPC Endpoint
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");

// load smart contract
async function loadContract(wallet, contractName) {
  const contractAddress = fs.readFileSync(
    `./logs/${contractName}Address.txt`,
    function (err) {
      if (err) throw err;
    }
  );

  const jsonData = fs.readFileSync(
    `./artifacts/${contractName}.json`,
    "utf8",
    function (err) {
      if (err) throw err;
    }
  );
  const jsonArray = JSON.parse(jsonData);

  contract = new ethers.Contract(
    contractAddress.toString(),
    jsonArray.abi,
    wallet
  );
}

async function setTx() {
  const wallet = new ethers.Wallet(
    "0x558dcca3d9b78d6a4225adde5731a6b6b2f6666c036b4eb5ca3e1b1eba610d63",
    provider
  );
  await loadContract(wallet, "Test");

  const amount = ethers.parseEther("0.0001");
  const res = await contract.setTx(amount);
  fs.writeFileSync(`./logs/TestTx.txt`, res.hash, function (err) {
    if (err) throw err;
    console.log("File is created successfully.");
  });
}

async function getTx() {
  const txHash = fs.readFileSync(`./logs/TestTx.txt`, function (err) {
    if (err) throw err;
  });
  const tx_deserialized = ethers.Transaction.from(
    await provider.getTransaction(txHash.toString())
  );
  console.log(JSON.stringify(tx_deserialized));
}

async function main() {
  setTx();
  // getTx();
}

main();
