const swaggerJsDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ecom-cart-service',
      version: '1.0.0',
      description: 'Carrinho de compras ativo por cliente — gerencia itens, quantidades e valida estoque via integracao com o catalogo de produtos.',
    },
    servers: [{ url: 'http://localhost:3002', description: 'Development' }],
  },
  apis: ['./src/routes/*.js', './src/app.js'],
};

module.exports = swaggerJsDoc(options);
