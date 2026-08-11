const couchbase = require('couchbase');
const config = require('../config');
const logger = require('../utils/logger');

class CouchbaseService {
  constructor() {
    this.cluster = null;
    this.bucket = null;
    this.scope = null;
    this.collections = {};
    this.connected = false;
  }

  async connect() {
    try {
      if (this.connected) {
        return true;
      }

      logger.info(
        `Connecting to Couchbase: ${config.couchbase.connectionString}`
      );

      this.cluster = await couchbase.connect(
        config.couchbase.connectionString,
        {
          username: config.couchbase.username,
          password: config.couchbase.password,
        }
      );

      await this.cluster.waitUntilReady(10000);

      this.bucket = this.cluster.bucket(
        config.couchbase.bucket
      );

      this.scope = this.bucket.scope(
        config.couchbase.scope
      );

      this.collections = {
        customers: this.scope.collection('customers'),
        orders: this.scope.collection('orders'),
        products: this.scope.collection('products'),
        addresses: this.scope.collection('addresses'),
        payments: this.scope.collection('payments'),
      };

      await this.bucket.ping();

      this.connected = true;

      logger.info(
        `Connected to Couchbase: ${config.couchbase.bucket}.${config.couchbase.scope}`
      );

      return true;

    } catch (error) {
      logger.error(
        `Couchbase connection failed: ${error.message}`
      );

      this.connected = false;

      throw error;
    }
  }

  async disconnect() {
    if (!this.cluster) {
      return;
    }

    try {
      await this.cluster.close();

      this.cluster = null;
      this.bucket = null;
      this.scope = null;
      this.collections = {};
      this.connected = false;

      logger.info('Disconnected from Couchbase');

    } catch (error) {
      logger.error(
        `Error disconnecting from Couchbase: ${error.message}`
      );

      throw error;
    }
  }

  async query(statement, params = {}, options = {}) {
    if (!this.connected || !this.cluster) {
      throw new Error('Couchbase not connected');
    }

    try {
      const queryOptions = {
        parameters: params,
        timeout: options.timeout || config.query.timeout,
      };

      if (options.scanConsistency) {
        queryOptions.scanConsistency =
          options.scanConsistency;
      }

      const result = await this.cluster.query(
        statement,
        queryOptions
      );

      return result.rows || [];

    } catch (error) {
      logger.error(
        `Couchbase query error: ${error.message}`
      );

      throw error;
    }
  }

  async getDocument(collectionName, id) {
    if (!this.connected) {
      throw new Error('Couchbase not connected');
    }

    const collection = this.getCollection(collectionName);

    if (!collection) {
      throw new Error(
        `Collection '${collectionName}' not found`
      );
    }

    const result = await collection.get(id);

    return result.content;
  }

  async insertDocument(collectionName, id, document) {
    if (!this.connected) {
      throw new Error('Couchbase not connected');
    }

    const collection = this.getCollection(collectionName);

    if (!collection) {
      throw new Error(
        `Collection '${collectionName}' not found`
      );
    }

    await collection.insert(id, document);

    return document;
  }

  async upsertDocument(collectionName, id, document) {
    if (!this.connected) {
      throw new Error('Couchbase not connected');
    }

    const collection = this.getCollection(collectionName);

    if (!collection) {
      throw new Error(
        `Collection '${collectionName}' not found`
      );
    }

    await collection.upsert(id, document);

    return document;
  }

  async replaceDocument(collectionName, id, document) {
    if (!this.connected) {
      throw new Error('Couchbase not connected');
    }

    const collection = this.getCollection(collectionName);

    if (!collection) {
      throw new Error(
        `Collection '${collectionName}' not found`
      );
    }

    await collection.replace(id, document);

    return document;
  }

  async deleteDocument(collectionName, id) {
    if (!this.connected) {
      throw new Error('Couchbase not connected');
    }

    const collection = this.getCollection(collectionName);

    if (!collection) {
      throw new Error(
        `Collection '${collectionName}' not found`
      );
    }

    await collection.remove(id);

    return {
      id,
      deleted: true,
    };
  }

  getCollection(name) {
    if (!this.collections[name]) {
      throw new Error(
        `Collection '${name}' is not configured`
      );
    }

    return this.collections[name];
  }

  getCluster() {
    if (!this.cluster) {
      throw new Error('Couchbase cluster not connected');
    }

    return this.cluster;
  }

  getBucket() {
    if (!this.bucket) {
      throw new Error('Couchbase bucket not initialized');
    }

    return this.bucket;
  }

  getScope() {
    if (!this.scope) {
      throw new Error('Couchbase scope not initialized');
    }

    return this.scope;
  }

  async ping() {
    if (!this.connected || !this.bucket) {
      throw new Error('Couchbase not connected');
    }

    await this.bucket.ping();

    return true;
  }

  async healthCheck() {
    try {
      await this.ping();

      await this.query(
        `
        SELECT RAW 1
        FROM \`${config.couchbase.bucket}\`
        .\`${config.couchbase.scope}\`
        .customers
        LIMIT 1
        `
      );

      return {
        status: 'healthy',
        couchbase: true,
      };

    } catch (error) {
      logger.error(
        `Couchbase health check failed: ${error.message}`
      );

      return {
        status: 'unhealthy',
        couchbase: false,
        error: error.message,
      };
    }
  }
}

module.exports = new CouchbaseService();