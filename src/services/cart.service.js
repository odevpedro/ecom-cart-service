const { v4: uuid } = require('uuid');
const ProductCatalogClient = require('./product-catalog.client');
const UserClient = require('./user.client');

class CartService {
  constructor() {
    this.store = new Map();
    this.productClient = new ProductCatalogClient();
    this.userClient = new UserClient();
  }

  async getCart(userId) {
    const key = `cart:${userId}`;
    if (!this.store.has(key)) {
      return { userId, items: [], totalCents: 0 };
    }
    return this.store.get(key);
  }

  async addItem(userId, { productId, sku, quantity }) {
    const userExists = await this.userClient.userExists(userId);
    if (!userExists) {
      throw new Error('User not found');
    }

    const product = await this.productClient.getProduct(sku || productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const key = `cart:${userId}`;
    let cart = this.store.get(key) || { userId, items: [], totalCents: 0 };

    const existing = cart.items.find((i) => i.productId === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({
        id: uuid(),
        productId: product.id,
        sku: product.sku,
        name: product.name,
        unitPriceCents: product.priceCents,
        quantity,
        imageUrl: product.imageUrl || null,
      });
    }

    cart.totalCents = cart.items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0);
    this.store.set(key, cart);

    return cart;
  }

  async removeItem(userId, productId) {
    const key = `cart:${userId}`;
    const cart = this.store.get(key);
    if (!cart) throw new Error('Cart not found');

    cart.items = cart.items.filter((i) => i.productId !== productId);
    cart.totalCents = cart.items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0);
    this.store.set(key, cart);

    return cart;
  }

  async clearCart(userId) {
    this.store.delete(`cart:${userId}`);
    return { userId, items: [], totalCents: 0 };
  }
}

module.exports = CartService;
