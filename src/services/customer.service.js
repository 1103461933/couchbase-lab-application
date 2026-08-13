const { getScope, query } = require('./couchbase.service');
const { createCustomer } = require('../models/customer');

const COLLECTION_NAME = 'customers';

async function getAll(params = {}) {
  const { country, limit = 100 } = params;
  let queryString = `SELECT META(c).id, c.* FROM \`${process.env.COUCHBASE_BUCKET}\`.\`${process.env.COUCHBASE_SCOPE}\`.\`${COLLECTION_NAME}\` AS c`;
  
  const queryParams = {};
  if (country) {
    queryString += ` WHERE c.country = $country`;
    queryParams.country = country;
  }
  
  queryString += ` LIMIT ${limit}`;
  
  return query(queryString, queryParams);
}

async function create(data) {
  const customer = createCustomer(data);
  const collection = getScope().collection(COLLECTION_NAME);
  await collection.insert(customer.id, customer);
  return customer;
}

async function getById(id) {
  const collection = getScope().collection(COLLECTION_NAME);
  const result = await collection.get(id);
  return result.content;
}

async function update(id, data) {
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
  return { id, deleted: true };
}

module.exports = {
  getAll,
  create,      // Antes era createCustomerRecord
  getById,     // Antes era getCustomer
  update,
  delete: deleteCustomer,
};