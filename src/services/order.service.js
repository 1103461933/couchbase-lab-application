const { getScope, query } = require('./couchbase.service');
const { createOrder } = require('../models/order');

const COLLECTION_NAME = 'orders';

async function createOrderRecord(data) {
  const order = createOrder(data);

  const collection = getScope().collection(COLLECTION_NAME);

  await collection.insert(order.id, order);

  return order;
}

async function getOrder(id) {
  const collection = getScope().collection(COLLECTION_NAME);

  const result = await collection.get(id);

  return result.content;
}

async function findByCustomer(customerId) {
  return query(
    `
      SELECT META(o).id, o.*
      FROM \`${process.env.COUCHBASE_BUCKET}\`.\`${process.env.COUCHBASE_SCOPE}\`.\`${COLLECTION_NAME}\` AS o
      WHERE o.customerId = $customerId
    `,
    { customerId },
  );
}

async function updateOrder(id, data) {
  const collection = getScope().collection(COLLECTION_NAME);

  const existing = await collection.get(id);

  const order = {
    ...existing.content,
    ...data,
    id,
    updatedAt: new Date().toISOString(),
  };

  await collection.replace(id, order);

  return order;
}

module.exports = {
  createOrderRecord,
  getOrder,
  findByCustomer,
  updateOrder,
};