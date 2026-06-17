const { v4: uuid } = require('uuid');
const ProductCatalogClient = require('./product-catalog.client');
const UserClient = require('./user.client');
const db = require('../database');

class CartService {
  constructor() {
    this.store = new Map();
    this.productClient = new ProductCatalogClient();
    this.userClient = new UserClient();
    this.useDb = !!(db.sequelize);
  }

  async getCart(userId) {
    if (this.useDb) {
      return this._getCartDb(userId);
    }
    return this._getCartInMemory(userId);
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

    if (this.useDb) {
      return this._addItemDb(userId, product, quantity);
    }
    return this._addItemInMemory(userId, product, quantity);
  }

  async removeItem(userId, productId) {
    if (this.useDb) {
      return this._removeItemDb(userId, productId);
    }
    return this._removeItemInMemory(userId, productId);
  }

  async clearCart(userId) {
    if (this.useDb) {
      return this._clearCartDb(userId);
    }
    return this._clearCartInMemory(userId);
  }

  _getCartInMemory(userId) {
    const key = `cart:${userId}`;
    if (!this.store.has(key)) {
      return { userId, items: [], totalCents: 0 };
    }
    return this.store.get(key);
  }

  _addItemInMemory(userId, product, quantity) {
    const key = `cart:${userId}`;
    const cart = this.store.get(key) || { userId, items: [], totalCents: 0 };

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

    cart.totalCents = cart.items.reduce(
      (sum, i) => sum + i.unitPriceCents * i.quantity,
      0,
    );
    this.store.set(key, cart);

    return cart;
  }

  _removeItemInMemory(userId, productId) {
    const key = `cart:${userId}`;
    const cart = this.store.get(key);
    if (!cart) return { userId, items: [], totalCents: 0 };

    const idx = cart.items.findIndex((i) => i.productId === productId);
    if (idx !== -1) {
      if (cart.items[idx].quantity > 1) {
        cart.items[idx].quantity -= 1;
      } else {
        cart.items.splice(idx, 1);
      }
    }

    cart.totalCents = cart.items.reduce(
      (sum, i) => sum + i.unitPriceCents * i.quantity,
      0,
    );
    this.store.set(key, cart);

    return cart;
  }

  _clearCartInMemory(userId) {
    this.store.delete(`cart:${userId}`);
    return { userId, items: [], totalCents: 0 };
  }

  async _getCartDb(userId) {
    const cart = await db.Cart.findOne({
      where: { userId },
      include: [{ model: db.CartItem, as: 'items' }],
    });

    if (!cart) {
      return { userId, items: [], totalCents: 0 };
    }

    return cart.toJSON();
  }

  async _addItemDb(userId, product, quantity) {
    const [cart] = await db.Cart.findOrCreate({
      where: { userId },
      defaults: { userId },
    });

    let item = await db.CartItem.findOne({
      where: { cartId: cart.id, productId: product.id },
    });

    if (item) {
      item.quantity += quantity;
      await item.save();
    } else {
      await db.CartItem.create({
        cartId: cart.id,
        productId: product.id,
        sku: product.sku,
        name: product.name,
        unitPriceCents: product.priceCents,
        quantity,
        imageUrl: product.imageUrl || null,
      });
    }

    const items = await db.CartItem.findAll({ where: { cartId: cart.id } });
    const totalCents = items.reduce(
      (sum, i) => sum + i.unitPriceCents * i.quantity,
      0,
    );
    cart.totalCents = totalCents;
    await cart.save();

    return this._getCartDb(userId);
  }

  async _removeItemDb(userId, productId) {
    const cart = await db.Cart.findOne({ where: { userId } });
    if (!cart) return { userId, items: [], totalCents: 0 };

    const item = await db.CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    if (item) {
      if (item.quantity > 1) {
        item.quantity -= 1;
        await item.save();
      } else {
        await item.destroy();
      }
    }

    const items = await db.CartItem.findAll({ where: { cartId: cart.id } });
    cart.totalCents = items.reduce(
      (sum, i) => sum + i.unitPriceCents * i.quantity,
      0,
    );
    await cart.save();

    return this._getCartDb(userId);
  }

  async _clearCartDb(userId) {
    const cart = await db.Cart.findOne({ where: { userId } });
    if (cart) {
      await db.CartItem.destroy({ where: { cartId: cart.id } });
      cart.totalCents = 0;
      await cart.save();
    }
    return { userId, items: [], totalCents: 0 };
  }
}

module.exports = CartService;
