const couchbaseService = require('./couchbase.service');
const config = require('../config');
const logger = require('../utils/logger');

class CustomerService {
  constructor() {
    this.collection = null;
  }

  async getCollection() {
    if (!this.collection) {
      this.collection = couchbaseService.getCollection('customers');
    }
    return this.collection;
  }

  async getAll(filters = {}) {
    try {
      const { country, status, limit = config.query.maxLimit } = filters;
      let query = `SELECT * FROM \`${config.couchbase.bucket}\`.${config.couchbase.scope}.customers`;
      const conditions = [];
      
      if (country) conditions.push(`country = '${country}'`);
      if (status) conditions.push(`status = '${status}'`);
      
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }
      
      query += ` ORDER BY createdAt DESC LIMIT ${parseInt(limit)}`;
      
      const result = await couchbaseService.query(query);
      return result.map(row => row.customers || row);
    } catch (error) {
      logger.error('Error getting customers:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const collection = await this.getCollection();
      const result = await collection.get(id);
      return result.content;
    } catch (error) {
      if (error.message.includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  async create(customerData) {
    try {
      const collection = await this.getCollection();
      
      const customer = {
        ...customerData,
        createdAt: customerData.createdAt || new Date().toISOString(),
        status: customerData.status || 'active',
        metadata: {
          version: 1,
          source: 'api',
          createdAt: new Date().toISOString()
        }
      };
      
      const key = `customer-${customerData.customerId}`;
      const result = await collection.upsert(key, customer);
      
      return {
        id: key,
        customer,
        cas: result.cas.toString()
      };
    } catch (error) {
      logger.error('Error creating customer:', error);
      throw error;
    }
  }

  async update(id, updates) {
    try {
      const collection = await this.getCollection();
      
      // Get existing customer
      const existing = await collection.get(id);
      if (!existing.content) {
        return null;
      }
      
      const updatedCustomer = {
        ...existing.content,
        ...updates,
        metadata: {
          ...existing.content.metadata,
          version: (existing.content.metadata?.version || 0) + 1,
          updatedAt: new Date().toISOString()
        }
      };
      
      const result = await collection.upsert(id, updatedCustomer);
      
      return {
        id,
        customer: updatedCustomer,
        cas: result.cas.toString()
      };
    } catch (error) {
      logger.error('Error updating customer:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const collection = await this.getCollection();
      await collection.remove(id);
      return true;
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new Error('Customer not found');
      }
      throw error;
    }
  }
}

module.exports = new CustomerService();