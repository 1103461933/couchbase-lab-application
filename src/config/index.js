require('dotenv').config();

const required = [
  'COUCHBASE_CONNECTION_STRING',
  'COUCHBASE_USERNAME',
  'COUCHBASE_PASSWORD',
  'COUCHBASE_BUCKET',
  'COUCHBASE_SCOPE'
];

const missing = required.filter(key => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  env: process.env.NODE_ENV || 'development',
  
  couchbase: {
    connectionString: process.env.COUCHBASE_CONNECTION_STRING,
    username: process.env.COUCHBASE_USERNAME,
    password: process.env.COUCHBASE_PASSWORD,
    bucket: process.env.COUCHBASE_BUCKET,
    scope: process.env.COUCHBASE_SCOPE,
  },
  
  logging: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  
  query: {
    timeout: parseInt(process.env.QUERY_TIMEOUT || '30000', 10),
    maxLimit: parseInt(process.env.MAX_QUERY_LIMIT || '1000', 10),
  }
};

module.exports = config;