const { getScope, query } = require('./couchbase.service');
const { createCustomer } = require('../models/customer');

const COLLECTION_NAME = 'customers';

// Sincronizado con la ruta: recibe un objeto con country, status, limit
async function getAll(params = {}) {
  const { country, limit = 100 } = params;
  
  let statement = `
    SELECT META(c).id, c.*
    FROM \`${process.env.COUCHBASE_BUCKET}\`.\`${process.env.COUCHBASE_SCOPE}\`.\`${COLLECTION_NAME}\` AS c
  `;

  const queryParams = {};
  if (country) {
    statement += ` WHERE c.country = $country`;
    queryParams.country = country;
  }

  statement += ` LIMIT ${limit}`;

  return query(statement, queryParams);
}

// Nombre sincronizado: create
async function create(data) {
  const customer = createCustomer(data);
  const collection = getScope().collection(COLLECTION_NAME);
  await collection.insert(customer.id, customer);
  return customer;
}

// Nombre sincronizado: getById
async function getById(id) {
  const collection = getScope().collection(COLLECTION_NAME);
  const result = await collection.get(id);
  return result.content;
}

// Nombre sincronizado: update
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

// Nombre sincronizado: delete
async function deleteCustomer(id) {
  const collection = getScope().collection(COLLECTION_NAME);
  await collection.remove(id);
  return { id, deleted: true };
}

module.exports = {
  getAll,
  create,
  getById,
  update,
  delete: deleteCustomer, // Exportamos deleteCustomer como 'delete'
};