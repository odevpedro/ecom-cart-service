const CartService = require('./cart.service');

jest.mock('./product-catalog.client');
jest.mock('./user.client');

const ProductCatalogClient = require('./product-catalog.client');
const UserClient = require('./user.client');

describe('CartService', () => {
  let service;

  beforeEach(() => {
    ProductCatalogClient.mockImplementation(() => ({
      getProduct: jest.fn().mockResolvedValue({ id: 'prod-1', sku: 'SKU-1', name: 'Produto', priceCents: 1000 }),
    }));
    UserClient.mockImplementation(() => ({
      userExists: jest.fn().mockResolvedValue(true),
    }));
    service = new CartService();
  });

  it('returns empty cart for new user', async () => {
    const cart = await service.getCart('user-1');
    expect(cart.items).toEqual([]);
    expect(cart.totalCents).toBe(0);
  });

  it('adds item to cart', async () => {
    const cart = await service.addItem('user-1', { productId: 'prod-1', sku: 'SKU-1', quantity: 2 });
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(2);
    expect(cart.totalCents).toBe(2000);
  });

  it('increments quantity for existing item', async () => {
    await service.addItem('user-1', { productId: 'prod-1', sku: 'SKU-1', quantity: 1 });
    const cart = await service.addItem('user-1', { productId: 'prod-1', sku: 'SKU-1', quantity: 3 });
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(4);
  });

  it('removes item from cart', async () => {
    await service.addItem('user-1', { productId: 'prod-1', sku: 'SKU-1', quantity: 1 });
    const cart = await service.removeItem('user-1', 'prod-1');
    expect(cart.items).toHaveLength(0);
    expect(cart.totalCents).toBe(0);
  });

  it('clears entire cart', async () => {
    await service.addItem('user-1', { productId: 'prod-1', sku: 'SKU-1', quantity: 1 });
    const cart = await service.clearCart('user-1');
    expect(cart.items).toEqual([]);
    expect(cart.totalCents).toBe(0);
  });

  it('throws when user not found', async () => {
    UserClient.mockImplementation(() => ({
      userExists: jest.fn().mockResolvedValue(false),
    }));
    service = new CartService();

    await expect(
      service.addItem('invalid-user', { productId: 'prod-1', sku: 'SKU-1', quantity: 1 })
    ).rejects.toThrow('User not found');
  });

  it('throws when product not found', async () => {
    ProductCatalogClient.mockImplementation(() => ({
      getProduct: jest.fn().mockResolvedValue(null),
    }));
    service = new CartService();

    await expect(
      service.addItem('user-1', { productId: 'invalid', sku: 'INVALID', quantity: 1 })
    ).rejects.toThrow('Product not found');
  });
});
