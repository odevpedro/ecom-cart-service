const { Router } = require('express');
const CartController = require('../controllers/cart.controller');

const router = Router();
const controller = new CartController();

/**
 * @openapi
 * /api/cart/{userId}:
 *   get:
 *     tags: [Cart]
 *     summary: Retorna o carrinho ativo do usuario
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Carrinho do usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId: { type: string }
 *                     items: { type: array, items: { type: object } }
 *                     totalCents: { type: integer }
 *   delete:
 *     tags: [Cart]
 *     summary: Limpa o carrinho do usuario
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Carrinho limpo
 */
router.get('/:userId', controller.getCart.bind(controller));
router.delete('/:userId', controller.clearCart.bind(controller));

/**
 * @openapi
 * /api/cart/{userId}/items:
 *   post:
 *     tags: [Cart]
 *     summary: Adiciona item ao carrinho
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId: { type: string }
 *               quantity: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Item adicionado
 *       404:
 *         description: Produto ou usuario nao encontrado
 *
 * /api/cart/{userId}/items/{productId}:
 *   delete:
 *     tags: [Cart]
 *     summary: Remove item do carrinho
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Item removido
 */
router.post('/:userId/items', controller.addItem.bind(controller));
router.delete('/:userId/items/:productId', controller.removeItem.bind(controller));

module.exports = router;
