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
          type: 'UUID',
          defaultValue: sequelize.literal('gen_random_uuid()'),
          primaryKey: true,
        },
        userId: { type: 'STRING', unique: true, allowNull: false },
        totalCents: { type: 'INTEGER', defaultValue: 0 },
        createdAt: { type: 'DATE', allowNull: false },
        updatedAt: { type: 'DATE', allowNull: false },
      });

      await queryInterface.createTable('cart_items', {
        id: {
          type: 'UUID',
          defaultValue: sequelize.literal('gen_random_uuid()'),
          primaryKey: true,
        },
        cartId: {
          type: 'UUID',
          allowNull: false,
          references: { model: 'carts', key: 'id' },
          onDelete: 'CASCADE',
        },
        productId: { type: 'STRING', allowNull: false },
        sku: { type: 'STRING' },
        name: { type: 'STRING' },
        unitPriceCents: { type: 'INTEGER' },
        quantity: { type: 'INTEGER', defaultValue: 1 },
        imageUrl: { type: 'STRING' },
        createdAt: { type: 'DATE', allowNull: false },
        updatedAt: { type: 'DATE', allowNull: false },
      });
    }
  } catch (err) {
    console.error('Migration failed:', err.message);
    throw err;
  }
}

module.exports = { runMigrations };
