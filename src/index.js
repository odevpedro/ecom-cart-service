const app = require('./app');
const config = require('./config');

app.listen(config.port, () => {
  console.log(`Cart Service running on port ${config.port}`);
});
