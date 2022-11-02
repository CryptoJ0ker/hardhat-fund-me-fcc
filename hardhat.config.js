require("@nomicfoundation/hardhat-toolbox")
require("hardhat-deploy")
require("hardhat-gas-reporter")
require("@nomiclabs/hardhat-etherscan")
require("dotenv").config()
require("solidity-coverage")

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
    },
    defaultNetwork: "hardhat",
    networks: {
        goerli: {
            url: process.env.GOERLI_RPC_URL || "",
            accounts: [process.env.PRIVATE_KEY],
            blockConfirmations: 6,
            chainId: 5,
        },
        hardhat: {
            chainId: 31337,
            // gasPrice: 130000000000,
        },
    },
    gasReporter: {
        // enabled: process.env.REPORT_GAS ? true : false,
        enabled: false,
        currency: "USD",
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
        token: "ETH",
        // outputFile: "gas-report.txt",
        noColors: false,
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY || undefined,
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        user: {
            default: 1,
        },
    },
}
