const CartService = require('./cart.service');

jest.mock('./product-catalog.client');
jest.mock('./user.client');
jest.mock('../database', () => ({ sequelize: null, Cart: null, CartItem: null }));

const ProductCatalogClient = require('./product-catalog.client');
const UserClient = require('./user.client');

describe('CartService (in-memory mode)', () => {
  let service;

  const defaultProduct = {
    id: 'prod-1',
    sku: 'SKU-001',
    name: 'Produto Teste',
    priceCents: 1000,
    imageUrl: 'http://img.test/prod-1.jpg',
  };

  const product2 = {
    id: 'prod-2',
    sku: 'SKU-002',
    name: 'Outro Produto',
    priceCents: 2500,
    imageUrl: null,
  };

  beforeEach(() => {
    ProductCatalogClient.mockClear();
    UserClient.mockClear();

    ProductCatalogClient.mockImplementation(() => ({
      getProduct: jest.fn().mockResolvedValue(defaultProduct),
    }));
    UserClient.mockImplementation(() => ({
      userExists: jest.fn().mockResolvedValue(true),
    }));
    service = new CartService();
  });

  describe('getCart', () => {
    it('returns empty cart for a new user', async () => {
      const cart = await service.getCart('user-1');

      expect(cart).toEqual({
        userId: 'user-1',
        items: [],
        totalCents: 0,
      });
    });

    it('returns existing cart with items after adding items', async () => {
      await service.addItem('user-1', {
        productId: 'prod-1',
        sku: 'SKU-001',
        quantity: 2,
      });

      const cart = await service.getCart('user-1');

      expect(cart.userId).toBe('user-1');
      expect(cart.items).toHaveLength(1);
      expect(cart.totalCents).toBe(2000);
    });

    it('returns empty cart for a different user', async () => {
      await service.addItem('user-1', {
        productId: 'prod-1',
        sku: 'SKU-001',
        quantity: 1,
      });

      const cart = await service.getCart('user-2');

      expect(cart.items).toEqual([]);
      expect(cart.totalCents).toBe(0);
    });
  });

  describe('addItem', () => {
    it('adds a single item with correct structure', async () => {
      const cart = await service.addItem('user-1', {
        productId: 'prod-1',
        sku: 'SKU-001',
        quantity: 1,
      });

      expect(cart.userId).toBe('user-1');
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0]).toMatchObject({
        productId: 'prod-1',
        sku: 'SKU-001',
        name: 'Produto Teste',
        unitPriceCents: 1000,
        quantity: 1,
        imageUrl: 'http://img.test/prod-1.jpg',
      });
      expect(cart.items[0].id).toBeDefined();
      expect(cart.totalCents).toBe(1000);
    });

    it('increments quantity for an existing item', async () => {
      await service.addItem('user-1', {
        productId: 'prod-1',
        sku: 'SKU-001',
        quantity: 1,
      });

      const cart = await service.addItem('user-1', {
        productId: 'prod-1',
        sku: 'SKU-001',
        quantity: 3,
      });

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(4);
      expect(cart.totalCents).toBe(4000);
    });

    it('adds item with quantity greater than 1', async () => {
      const cart = await service.addItem('user-1', {
        productId: 'prod-1',
        sku: 'SKU-001',
        quantity: 5,
      });

      expect(cart.items[0].quantity).toBe(5);
      expect(cart.totalCents).toBe(5000);
    });

    it('adds multiple different items and calculates total correctly', async () => {
      const mockGetProduct = jest
        .fn()
        .mockResolvedValueOnce(defaultProduct)
        .mockResolvedValueOnce(product2);

      ProductCatalogClient.mockImplementation(() => ({
        getProduct: mockGetProduct,
      }));
      service = new CartService();

      await service.addItem('user-1', {
        productId: 'prod-1',
        sku: 'SKU-001',
        quantity: 2,
      });

      const cart = await service.addItem('user-1', {
        productId: 'prod-2',
        sku: 'SKU-002',
        quantity: 1,
      });

      expect(cart.items).toHaveLength(2);
      expect(cart.totalCents).toBe(4500);
    });

    it('throws when user is not found', async () => {
      UserClient.mockImplementation(() => ({
        userExists: jest.fn().mockResolvedValue(false),
      }));
      service = new CartService();

      await expect(
        service.addItem('invalid-user', {
          productId: 'prod-1',
          sku: 'SKU-001',
          quantity: 1,
        }),
      ).rejects.toThrow('User not found');
    });

    it('throws when product is not found', async () => {
      ProductCatalogClient.mockImplementation(() => ({
        getProduct: jest.fn().mockResolvedValue(null),
      }));
      service = new CartService();

      await expect(
        service.addItem('user-1', {
          productId: 'invalid',
          sku: 'INVALID',
          quantity: 1,
        }),
      ).rejects.toThrow('Product not found');
    });

    it('looks up product by productId when sku is not provided', async () => {
      const getProductSpy = jest.fn().mockResolvedValue(defaultProduct);
      ProductCatalogClient.mockImplementation(() => ({
        getProduct: getProductSpy,
      }));
      service = new CartService();

      await service.addItem('user-1', {
        productId: 'prod-1',
        quantity: 1,
      });

      expect(getProductSpy).toHaveBeenCalledWith('prod-1');
    });
  });

  describe('removeItem', () => {
    it('removes an item with quantity 1 completely', async () => {
      await service.addItem('user-1', {
        productId: 'prod-1',
        sku: 'SKU-001',
        quantity: 1,
      });

      const cart = await service.removeItem('user-1', 'prod-1');

      expect(cart.items).toHaveLength(0);
      expect(cart.totalCents).toBe(0);
    });

    it('decrements quantity when item has quantity > 1', async () => {
      await service.addItem('user-1', {
        productId: 'prod-1',
        sku: 'SKU-001',
        quantity: 3,
      });

      const cart = await service.removeItem('user-1', 'prod-1');

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(2);
      expect(cart.totalCents).toBe(2000);
    });

    it('does nothing when removing a non-existing item', async () => {
      await service.addItem('user-1', {
        productId: 'prod-1',
        sku: 'SKU-001',
        quantity: 2,
      });

      const cart = await service.removeItem('user-1', 'non-existent');

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(2);
      expect(cart.totalCents).toBe(2000);
    });

    it('returns empty cart when removing from a non-existing cart', async () => {
      const cart = await service.removeItem('unknown-user', 'prod-1');

      expect(cart.items).toEqual([]);
      expect(cart.totalCents).toBe(0);
      expect(cart.userId).toBe('unknown-user');
    });

    it('recalculates total after removing one of multiple items', async () => {
      const mockGetProduct = jest
        .fn()
        .mockResolvedValueOnce(defaultProduct)
        .mockResolvedValueOnce(product2);

      ProductCatalogClient.mockImplementation(() => ({
        getProduct: mockGetProduct,
      }));
      service = new CartService();

      await service.addItem('user-1', {
        productId: 'prod-1',
        sku: 'SKU-001',
        quantity: 2,
      });

      await service.addItem('user-1', {
        productId: 'prod-2',
        sku: 'SKU-002',
        quantity: 1,
      });

      const cart = await service.removeItem('user-1', 'prod-1');

      expect(cart.items).toHaveLength(2);
      expect(cart.items[0].quantity).toBe(1);
      expect(cart.totalCents).toBe(3500);
    });
  });

  describe('clearCart', () => {
    it('clears entire cart', async () => {
      await service.addItem('user-1', {
        productId: 'prod-1',
        sku: 'SKU-001',
        quantity: 1,
      });

      const cart = await service.clearCart('user-1');

      expect(cart.items).toEqual([]);
      expect(cart.totalCents).toBe(0);
      expect(cart.userId).toBe('user-1');
    });

    it('clears already empty cart without error', async () => {
      const cart = await service.clearCart('user-1');

      expect(cart.items).toEqual([]);
      expect(cart.totalCents).toBe(0);
    });

    it('allows adding items after clearing', async () => {
      await service.addItem('user-1', {
        productId: 'prod-1',
        sku: 'SKU-001',
        quantity: 2,
      });

      await service.clearCart('user-1');

      const cart = await service.addItem('user-1', {
        productId: 'prod-1',
        sku: 'SKU-001',
        quantity: 3,
      });

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(3);
      expect(cart.totalCents).toBe(3000);
    });
  });

  describe('cart isolation', () => {
    it('keeps carts separate for different users', async () => {
      await service.addItem('user-1', {
        productId: 'prod-1',
        sku: 'SKU-001',
        quantity: 1,
      });

      await service.addItem('user-2', {
        productId: 'prod-1',
        sku: 'SKU-001',
        quantity: 3,
      });

      const cart1 = await service.getCart('user-1');
      const cart2 = await service.getCart('user-2');

      expect(cart1.items).toHaveLength(1);
      expect(cart1.items[0].quantity).toBe(1);
      expect(cart2.items).toHaveLength(1);
      expect(cart2.items[0].quantity).toBe(3);
    });
  });

  describe('total calculation', () => {
    it('recalculates total when adding items multiple times', async () => {
      await service.addItem('user-1', {
        productId: 'prod-1',
        sku: 'SKU-001',
        quantity: 1,
      });
      await service.addItem('user-1', {
        productId: 'prod-1',
        sku: 'SKU-001',
        quantity: 2,
      });

      const cart = await service.getCart('user-1');
      expect(cart.totalCents).toBe(3000);
    });

    it('total is 0 when cart is empty', async () => {
      const cart = await service.getCart('user-1');
      expect(cart.totalCents).toBe(0);
    });
  });
});
