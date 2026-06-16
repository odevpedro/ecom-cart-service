const axios = require('axios');
const config = require('../config');

class ProductCatalogClient {
  async getProduct(sku) {
    try {
      const { data } = await axios.get(
        `${config.productCatalogUrl}/api/products`,
        { params: { sku }, timeout: 5000 },
      );

      if (Array.isArray(data)) {
        return data.find((p) => p.sku === sku) || null;
      }
      return null;
    } catch {
      return null;
    }
  }
}

module.exports = ProductCatalogClient;
