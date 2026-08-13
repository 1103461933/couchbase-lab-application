const couchbase = require('couchbase');
const config = require('../config');
const logger = require('../utils/logger');

class CouchbaseService {
  constructor() {
    this.cluster = null;
    this.bucket = null;
    this.scope = null;
    this.connected = false;

    // Vinculamos funciones para evitar errores de 'this' y asegurar el contexto
    this.connect = this.connect.bind(this);
    this.query = this.query.bind(this);
    this.getScope = this.getScope.bind(this);
    this.getCollection = this.getCollection.bind(this); // <-- Nueva función vinculada
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

      // Esperar a que el cluster esté listo (10 segundos máximo)
      await this.cluster.waitUntilReady(10000);

      // Inicializar Bucket y Scope por defecto (definidos en config/env)
      this.bucket = this.cluster.bucket(config.couchbase.bucket);
      this.scope = this.bucket.scope(config.couchbase.scope);
      
      this.connected = true;

      logger.info(`Connected to Couchbase Cluster. Default Bucket: ${config.couchbase.bucket}`);
      return true;
    } catch (error) {
      logger.error(`Couchbase connection failed: ${error.message}`);
      this.connected = false;
      return false;
    }
  }

  /**
   * Permite obtener cualquier colección de cualquier bucket y scope.
   * Útil para tu arquitectura de múltiples buckets (orders, customers, inventory).
   */
  getCollection(bucketName, scopeName, collectionName) {
    if (!this.connected || !this.cluster) {
      throw new Error('Couchbase not connected');
    }
    return this.cluster.bucket(bucketName).scope(scopeName).collection(collectionName);
  }

  async ping() {
    if (!this.connected || !this.bucket) {
      throw new Error('Couchbase not connected');
    }
    return await this.bucket.ping();
  }

  async query(statement, params = {}) {
    if (!this.connected) throw new Error('Couchbase not connected');
    
    try {
      const result = await this.cluster.query(statement, { parameters: params });
      return result.rows || [];
    } catch (error) {
      logger.error(`Query execution error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retorna el scope por defecto (configurado en el .env)
   */
  getScope() {
    if (!this.scope) throw new Error('Default scope not initialized');
    return this.scope;
  }

  async healthCheck() {
    try {
      if (!this.connected) {
        return { status: 'unhealthy', couchbase: 'disconnected' };
      }
      // El ping verifica que la comunicación con el bucket sea posible
      await this.ping();
      return { 
        status: 'healthy', 
        couchbase: 'connected',
        version: config.app.version || '1.0.0'
      };
    } catch (error) {
      logger.error(`Health Check failed: ${error.message}`);
      return { 
        status: 'unhealthy', 
        couchbase: 'error', 
        error: error.message 
      };
    }
  }
}

// Exportamos la instancia (Singleton)
module.exports = new CouchbaseService();