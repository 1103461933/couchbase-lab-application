// IMPORTANTE: Este archivo requiere al anterior
const couchbaseService = require('./couchbase.service');
const { createCustomer } = require('../models/customer');

const COLLECTION_NAME = 'customers';

async function getAll(params = {}) {
  const { country, limit = 100 } = params;
  
  const bucketName = process.env.COUCHBASE_BUCKET;
  const scopeName = process.env.COUCHBASE_SCOPE;
  
  let statement = `SELECT META(c).id, c.* FROM \`${bucketName}\`.\`${scopeName}\`.\`${COLLECTION_NAME}\` AS c`;
  
  const queryParams = {};
  if (country) {
    statement += ` WHERE c.country = $country`;
    queryParams.country = country;
  }
  
  statement += ` LIMIT ${limit}`;
  
  // Llamamos a la función query del servicio de conexión
  return couchbaseService.query(statement, queryParams);
}

async function create(data) {
  const customer = createCustomer(data);
  const collection = couchbaseService.getScope().collection(COLLECTION_NAME);
  await collection.insert(customer.id, customer);
  return customer;
}

async function getById(id) {
  const collection = couchbaseService.getScope().collection(COLLECTION_NAME);
  const result = await collection.get(id);
  return result.content;
}

async function update(id, data) {
  const collection = couchbaseService.getScope().collection(COLLECTION_NAME);
  const existing = await collection.get(id);
  const customer = { ...existing.content, ...data, id, updatedAt: new Date().toISOString() };
  await collection.replace(id, customer);
  return customer;
}

async function deleteCustomer(id) {
  const collection = couchbaseService.getScope().collection(COLLECTION_NAME);
  await collection.remove(id);
  return { id, deleted: true };
}

// Exportamos las funciones que la RUTA está buscando
module.exports = {
  getAll,
  create,
  getById,
  update,
  delete: deleteCustomer
};