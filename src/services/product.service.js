const { getScope, query } = require('./couchbase.service');
const { createProduct } = require('../models/product');

const COLLECTION_NAME = 'products';

async function createProductRecord(data) {
  const product = createProduct(data);

  const collection = getScope().collection(COLLECTION_NAME);

  await collection.insert(product.id, product);

  return product;
}

async function getProduct(id) {
  const collection = getScope().collection(COLLECTION_NAME);

  const result = await collection.get(id);

  return result.content;
}

async function updateProduct(id, data) {
  const collection = getScope().collection(COLLECTION_NAME);

  const existing = await collection.get(id);

  const product = {
    ...existing.content,
    ...data,
    id,
    updatedAt: new Date().toISOString(),
  };

  await collection.replace(id, product);

  return product;
}

async function findByCategory(category) {
  return query(
    `
      SELECT META(p).id, p.*
      FROM \`${process.env.COUCHBASE_BUCKET}\`.\`${process.env.COUCHBASE_SCOPE}\`.\`${COLLECTION_NAME}\` AS p
      WHERE p.category = $category
    `,
    { category },
  );
}

module.exports = {
  createProductRecord,
  getProduct,
  updateProduct,
  findByCategory,
};