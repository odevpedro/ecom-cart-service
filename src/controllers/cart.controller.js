const CartService = require('../services/cart.service');

class CartController {
  constructor() {
    this.cartService = new CartService();
  }

  async getCart(req, res) {
    try {
      const cart = await this.cartService.getCart(req.params.userId);
      res.json(cart);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async addItem(req, res) {
    try {
      const cart = await this.cartService.addItem(req.params.userId, {
        productId: req.body.productId,
        sku: req.body.sku,
        quantity: req.body.quantity || 1,
      });
      res.json(cart);
    } catch (err) {
      const status = err.message === 'Product not found' || err.message === 'User not found' ? 404 : 400;
      res.status(status).json({ error: err.message });
    }
  }

  async removeItem(req, res) {
    try {
      const cart = await this.cartService.removeItem(req.params.userId, req.params.productId);
      res.json(cart);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }

  async clearCart(req, res) {
    try {
      const cart = await this.cartService.clearCart(req.params.userId);
      res.json(cart);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = CartController;
