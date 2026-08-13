const couchbase = require('couchbase');
const config = require('../config');
const logger = require('../utils/logger');

class CouchbaseService {
  constructor() {
    this.cluster = null;
    this.bucket = null;
    this.scope = null;
    this.connected = false;

    // Vinculamos funciones para evitar errores de 'this'
    this.connect = this.connect.bind(this);
    this.query = this.query.bind(this);
    this.getScope = this.getScope.bind(this);
    this.ping = this.ping.bind(this);
    this.healthCheck = this.healthCheck.bind(this);
  }

  async connect() {
    try {
      if (this.connected) return true;

      logger.info(`Connecting to Couchbase: ${config.couchbase.connectionString}`);

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
      return false;
    }
  }

  async ping() {
    if (!this.connected || !this.bucket) {
      throw new Error('Couchbase not connected');
    }
    return await this.bucket.ping();
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

  async healthCheck() {
    try {
      if (!this.connected) {
        return { status: 'unhealthy', couchbase: 'disconnected' };
      }
      await this.ping();
      return { status: 'healthy', couchbase: 'connected' };
    } catch (error) {
      return { status: 'unhealthy', couchbase: 'error', error: error.message };
    }
  }
}

module.exports = new CouchbaseService();