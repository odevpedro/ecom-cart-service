const { Router } = require('express');
const CartController = require('../controllers/cart.controller');

const router = Router();
const controller = new CartController();

router.get('/:userId', controller.getCart.bind(controller));
router.post('/:userId/items', controller.addItem.bind(controller));
router.delete('/:userId/items/:productId', controller.removeItem.bind(controller));
router.delete('/:userId', controller.clearCart.bind(controller));

module.exports = router;
