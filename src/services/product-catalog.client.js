const axios = require('axios');
const config = require('../config');

class ProductCatalogClient {
  async getProduct(idOrSku) {
    try {
      const { data } = await axios.get(
        `${config.productCatalogUrl}/api/products/${idOrSku}`,
        { timeout: 5000 },
      );

      if (data && data.id) {
        return data;
      }
      return null;
    } catch {
      return null;
    }
  }
}

module.exports = ProductCatalogClient;
