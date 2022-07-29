require("@nomiclabs/hardhat-waffle");
const fs = require("fs")
const privateKey = "689af8efa8c651a91ad287602527f3af2fe9f6501a7ac4b061667b5a93e037fd"
const projecttID = "783d8145ba424c7aaac9c928c1785a44";

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337
    },
    mumbai:{
      url: `https://polygon-mumbai.infura.io/v3/${projecttID}`,
      accounts: [privateKey],
    },
    mainnet: {
      url : `https://polygon-mainnet.infura.io/v3/${projecttID}`,
      accounts: [privateKey],
    },
  },
  solidity: "0.8.4",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};
