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

    // ✅ IMPORTANTE: Vincular el contexto de 'this' a los métodos
    this.connect = this.connect.bind(this);
    this.query = this.query.bind(this);
    this.getScope = this.getScope.bind(this);
    this.getCollection = this.getCollection.bind(this);
    this.healthCheck = this.healthCheck.bind(this);
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
    if (!this.cluster) return;
    try {
      await this.cluster.close();
      this.cluster = null;
      this.connected = false;
      logger.info('Disconnected from Couchbase');
    } catch (error) {
      logger.error(`Error disconnecting: ${error.message}`);
      throw error;
    }
  }

  async query(statement, params = {}, options = {}) {
    // Ahora 'this' siempre será la instancia de la clase
    if (!this.connected || !this.cluster) {
      throw new Error('Couchbase not connected');
    }

    try {
      const queryOptions = {
        parameters: params,
        timeout: options.timeout || config.query.timeout,
      };

      if (options.scanConsistency) {
        queryOptions.scanConsistency = options.scanConsistency;
      }

      const result = await this.cluster.query(statement, queryOptions);
      return result.rows || [];
    } catch (error) {
      logger.error(`Couchbase query error: ${error.message}`);
      throw error;
    }
  }

  getScope() {
    if (!this.scope) {
      throw new Error('Couchbase scope not initialized');
    }
    return this.scope;
  }

  getCollection(name) {
    if (!this.collections[name]) {
      throw new Error(`Collection '${name}' is not configured`);
    }
    return this.collections[name];
  }

  async healthCheck() {
    try {
      if (!this.connected) return { status: 'unhealthy', error: 'Not connected' };
      return { status: 'healthy', couchbase: true };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}

// Exportamos una instancia única (Singleton)
module.exports = new CouchbaseService();