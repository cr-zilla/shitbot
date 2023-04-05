const axios = require("axios");
const config = require("./config.js")
const API_KEY = config.ETHERSCAN_API_KEY

async function getContractSourceCode(address) {
    const response = await axios.get(
      `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${address}&apikey=${API_KEY}`
    );
    if (
      response.data &&
      response.data.result &&
      response.data.result.length > 0
    ) {
      return response.data.result[0].SourceCode;
    }
    throw new Error(
      `Failed to retrieve contract source code for address ${address}`
    );
  }

  module.exports = {
    getContractSourceCode,
  }