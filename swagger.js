const swaggerJsdoc = require('swagger-jsdoc');

const spec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Utilidades',
      version: '1.0.0',
      description: 'Encurtador de links, gerador de senhas, QR Code e conversor de texto.'
    }
  },
  apis: ['./server.js']
});

module.exports = spec;
