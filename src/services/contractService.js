import { ethers } from 'ethers';

// 步驟二：準備合約的「說明書」(ABI) 和地址
const fundDeployerAddress = '0x9D2C19a267caDA33da70d74aaBF9d2f75D3CdC14';
const fundDeployerAbi = [
  {
    "inputs": [
      { "internalType": "address", "name": "_fundOwner", "type": "address" },
      { "internalType": "string", "name": "_fundName", "type": "string" },
      { "internalType": "string", "name": "_fundSymbol", "type": "string" },
      {
        "components": [
          { "internalType": "address", "name": "denominationAsset", "type": "address" },
          { "internalType": "uint256", "name": "sharesActionTimelock", "type": "uint256" },
          { "internalType": "bytes", "name": "feeManagerConfigData", "type": "bytes" },
          { "internalType": "bytes", "name": "policyManagerConfigData", "type": "bytes" },
          { "components": [], "internalType": "struct IComptroller.ExtensionConfigInput[]", "name": "extensionsConfig", "type": "tuple[]" }
        ],
        "internalType": "struct IComptroller.ConfigInput",
        "name": "_comptrollerConfig",
        "type": "tuple"
      }
    ],
    "name": "createNewFund",
    "outputs": [
      { "internalType": "address", "name": "comptrollerProxy_", "type": "address" },
      { "internalType": "address", "name": "vaultProxy_", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // ABI for the event we want to parse
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
      { "indexed": false, "internalType": "address", "name": "comptrollerProxy", "type": "address" },
      { "indexed": false, "internalType": "address", "name": "vaultProxy", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "fundName", "type": "string" }
    ],
    "name": "NewFundCreated",
    "type": "event"
  }
];

// Sepolia Testnet Asset Addresses
const DENOMINATION_ASSETS = {
    'WETH': '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
    'USDC': '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    'USDT': '0x7169D38820df428814032DB436DE447446376Da6',
};


// 步驟三：建立真正的合約互動服務
const createFund = async (signer, formData) => {
  if (!signer) {
    throw new Error("Signer is not available. Please connect your wallet.");
  }

  const fundDeployer = new ethers.Contract(fundDeployerAddress, fundDeployerAbi, signer);
  const fundOwner = await signer.getAddress();

  // 1. 參數轉換
  const denominationAssetAddress = DENOMINATION_ASSETS[formData.basics.denominationAsset];
  if (!denominationAssetAddress) {
    throw new Error(`Unsupported denomination asset: ${formData.basics.denominationAsset}`);
  }

  // The contract expects the timelock in seconds, but the UI provides it in hours.
  // DEBUGGING STEP: Forcing a non-zero timelock to test hypothesis.
  console.log("DEBUG: Forcing sharesActionTimelock to 3600 for testing.");
  const sharesActionTimelockInSeconds = 3600;
  // const sharesActionTimelockInSeconds = parseFloat(formData.redemptions.lockUpPeriod) * 3600;

  // 2. 建構交易參數
  const comptrollerConfig = {
    denominationAsset: denominationAssetAddress,
    sharesActionTimelock: sharesActionTimelockInSeconds,
    // 3. 簡化設定：傳入空值
    feeManagerConfigData: "0x",
    policyManagerConfigData: "0x",
    extensionsConfig: []
  };

  try {
    console.log("Sending transaction to create new fund with params:", {
        fundOwner,
        fundName: formData.basics.name,
        fundSymbol: formData.basics.symbol,
        comptrollerConfig
    });

    // 4. 發送交易
    const tx = await fundDeployer.createNewFund(
      fundOwner,
      formData.basics.name,
      formData.basics.symbol,
      comptrollerConfig
    );

    // 5. 監聽結果
    console.log("Transaction sent. Waiting for confirmation...", tx.hash);
    const receipt = await tx.wait();
    console.log("Transaction confirmed.", receipt);

    // 6. 從日誌中解析出新創建的合約地址
    const event = receipt.events?.find(e => e.event === 'NewFundCreated');
    if (!event || !event.args) {
        throw new Error("Could not find NewFundCreated event in transaction receipt.");
    }

    const { comptrollerProxy, vaultProxy } = event.args;

    console.log("Successfully created fund:");
    console.log("Comptroller Proxy:", comptrollerProxy);
    console.log("Vault Proxy:", vaultProxy);

    return {
      comptrollerProxy,
      vaultProxy
    };

  } catch (error) {
    console.error("Error creating fund:", error);
    // Try to extract a more user-friendly error message
    if (error.reason) {
        throw new Error(`Transaction failed: ${error.reason}`);
    }
    if (error.data && error.data.message) {
        throw new Error(`Transaction failed: ${error.data.message}`);
    }
    if (error.message) {
        throw new Error(error.message);
    }
    throw new Error("An unknown error occurred during fund creation.");
  }
};

export const contractService = {
  createFund
};
