const couchbase = require('couchbase');
const config = require('../config');
const logger = require('../utils/logger');

class CouchbaseService {
  constructor() {
    this.cluster = null;
    this.bucket = null;
    this.scope = null;
    this.connected = false;
    
    // Vinculamos funciones para no perder el 'this'
    this.connect = this.connect.bind(this);
    this.query = this.query.bind(this);
    this.getScope = this.getScope.bind(this);
  }

  async connect() {
    try {
      if (this.connected) return true;
      this.cluster = await couchbase.connect(config.couchbase.connectionString, {
        username: config.couchbase.username,
        password: config.couchbase.password,
      });
      await this.cluster.waitUntilReady(10000);
      this.bucket = this.cluster.bucket(config.couchbase.bucket);
      this.scope = this.bucket.scope(config.couchbase.scope);
      this.connected = true;
      logger.info('Connected to Couchbase Cluster');
      return true;
    } catch (error) {
      logger.error(`Couchbase connection failed: ${error.message}`);
      this.connected = false;
      throw error;
    }
  }

  async query(statement, params = {}) {
    if (!this.connected) throw new Error('Couchbase not connected');
    const result = await this.cluster.query(statement, { parameters: params });
    return result.rows || [];
  }

  getScope() {
    if (!this.scope) throw new Error('Scope not initialized');
    return this.scope;
  }
}

// Exporta una instancia única
module.exports = new CouchbaseService();