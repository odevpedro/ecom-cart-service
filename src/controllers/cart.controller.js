const CartService = require('../services/cart.service');

class AppError extends Error {
  constructor(message, status = 400, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

class CartController {
  constructor() {
    this.cartService = new CartService();
  }

  async getCart(req, res, next) {
    try {
      const cart = await this.cartService.getCart(req.params.userId);
      res.json(cart);
    } catch (err) {
      next(err);
    }
  }

  async addItem(req, res, next) {
    try {
      const cart = await this.cartService.addItem(req.params.userId, {
        productId: req.body.productId,
        sku: req.body.sku,
        quantity: req.body.quantity || 1,
      });
      res.json(cart);
    } catch (err) {
      if (err.message === 'Product not found') {
        next(new AppError(err.message, 404, 'PRODUCT_NOT_FOUND'));
      } else if (err.message === 'User not found') {
        next(new AppError(err.message, 404, 'USER_NOT_FOUND'));
      } else {
        next(err);
      }
    }
  }

  async removeItem(req, res, next) {
    try {
      const cart = await this.cartService.removeItem(req.params.userId, req.params.productId);
      res.json(cart);
    } catch (err) {
      next(new AppError(err.message, 404, 'CART_NOT_FOUND'));
    }
  }

  async clearCart(req, res, next) {
    try {
      const cart = await this.cartService.clearCart(req.params.userId);
      res.json(cart);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = CartController;
