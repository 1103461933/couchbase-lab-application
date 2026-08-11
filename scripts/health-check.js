const {
  connect,
  query,
  disconnect,
} = require('../src/services/couchbase.service');

async function main() {
  console.log('Checking Couchbase...');

  await connect();

  const result = await query(
    `
      SELECT RAW COUNT(*)
      FROM \`${process.env.COUCHBASE_BUCKET}\`
      LIMIT 1
    `,
  );

  console.log('Couchbase is healthy');
  console.log('Result:', result);

  await disconnect();
}

main().catch(async (error) => {
  console.error('Couchbase health check failed');
  console.error(error);

  try {
    await disconnect();
  } finally {
    process.exit(1);
  }
});