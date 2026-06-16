const axios = require('axios');
const config = require('../config');

class UserClient {
  async userExists(userId) {
    try {
      await axios.get(`${config.userServiceUrl}/api/users/${userId}`, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = UserClient;
