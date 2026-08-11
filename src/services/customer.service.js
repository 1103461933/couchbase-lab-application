const { getScope, query } = require('./couchbase.service');
const { createCustomer } = require('../models/customer');

const COLLECTION_NAME = 'customers';

async function createCustomerRecord(data) {
  const customer = createCustomer(data);

  const collection = getScope().collection(COLLECTION_NAME);

  await collection.insert(customer.id, customer);

  return customer;
}

async function getCustomer(id) {
  const collection = getScope().collection(COLLECTION_NAME);

  const result = await collection.get(id);

  return result.content;
}

async function updateCustomer(id, data) {
  const collection = getScope().collection(COLLECTION_NAME);

  const existing = await collection.get(id);

  const customer = {
    ...existing.content,
    ...data,
    id,
    updatedAt: new Date().toISOString(),
  };

  await collection.replace(id, customer);

  return customer;
}

async function deleteCustomer(id) {
  const collection = getScope().collection(COLLECTION_NAME);

  await collection.remove(id);

  return {
    id,
    deleted: true,
  };
}

async function findByCountry(country) {
  return query(
    `
      SELECT META(c).id, c.*
      FROM \`${process.env.COUCHBASE_BUCKET}\`.\`${process.env.COUCHBASE_SCOPE}\`.\`${COLLECTION_NAME}\` AS c
      WHERE c.country = $country
    `,
    { country },
  );
}

module.exports = {
  createCustomerRecord,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  findByCountry,
};