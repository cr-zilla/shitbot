const axios = require("axios");

async function getGoLabsTokenSecurity(tokenAddress) {
    const response = await axios.get(
        `https://api.gopluslabs.io/api/v1/token_security/1?contract_addresses=${tokenAddress}`
      );
    if (
      response
    ) {
      return response;
    }
    throw new Error(
      `Failed to get token security check details`
    );
  }

  module.exports = {
    getGoLabsTokenSecurity,
  }