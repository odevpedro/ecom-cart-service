const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

async function runMigrations() {
  if (!sequelize) return;

  const queryInterface = sequelize.getQueryInterface();

  try {
    const tables = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
      { type: sequelize.QueryTypes.SELECT },
    );

    if (!tables.find((t) => t.table_name === 'carts')) {
      await queryInterface.createTable('carts', {
        id: {
          type: DataTypes.UUID,
          defaultValue: sequelize.literal('gen_random_uuid()'),
          primaryKey: true,
        },
        userId: { type: DataTypes.STRING, unique: true, allowNull: false },
        totalCents: { type: DataTypes.INTEGER, defaultValue: 0 },
        createdAt: { type: DataTypes.DATE, allowNull: false },
        updatedAt: { type: DataTypes.DATE, allowNull: false },
      });

      await queryInterface.createTable('cart_items', {
        id: {
          type: DataTypes.UUID,
          defaultValue: sequelize.literal('gen_random_uuid()'),
          primaryKey: true,
        },
        cartId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'carts', key: 'id' },
          onDelete: 'CASCADE',
        },
        productId: { type: DataTypes.STRING, allowNull: false },
        sku: { type: DataTypes.STRING },
        name: { type: DataTypes.STRING },
        unitPriceCents: { type: DataTypes.INTEGER },
        quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
        imageUrl: { type: DataTypes.STRING },
        createdAt: { type: DataTypes.DATE, allowNull: false },
        updatedAt: { type: DataTypes.DATE, allowNull: false },
      });
    }
  } catch (err) {
    console.error('Migration failed:', err.message);
    throw err;
  }
}

module.exports = { runMigrations };
