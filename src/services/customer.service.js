// src/services/customer.service.js

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
  
  return couchbaseService.query(statement, queryParams);
}

// ✅ FUNCIÓN CORREGIDA
async function create(data) {
  // 1. Usamos el modelo para formatear el objeto
  const customer = createCustomer(data);
  
  // 2. REFUERZO: Si el modelo no generó el ID porque el validador quitó el campo,
  // lo tomamos directamente del customerId que sí viene en los datos.
  const docId = customer.id || data.customerId;

  if (!docId) {
    throw new Error("No se pudo determinar un ID válido para el cliente (falta customerId)");
  }

  // Aseguramos que el objeto que se guarda tenga el campo id
  customer.id = docId;

  const collection = couchbaseService.getScope().collection(COLLECTION_NAME);

  // 3. Insertamos usando docId como llave principal (Key)
  // Esto evita el error "invalid argument"
  await collection.insert(docId, customer);
  
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

module.exports = {
  getAll,
  create,
  getById,
  update,
  delete: deleteCustomer
};