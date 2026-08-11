const {
  connect,
  getScope,
  disconnect,
} = require('../src/services/couchbase.service');

function parseRecords() {
  const index = process.argv.indexOf('--records');

  if (index !== -1 && process.argv[index + 1]) {
    return Number(process.argv[index + 1]);
  }

  return 100;
}

async function main() {
  const records = parseRecords();

  await connect();

  const collection = getScope().collection('customers');

  console.log(`Creating ${records} customers...`);

  for (let i = 1; i <= records; i++) {
    const id = `customer-${i}`;

    const customer = {
      type: 'customer',
      id,
      name: `Customer ${i}`,
      email: `customer${i}@example.com`,
      country: i % 2 === 0 ? 'Colombia' : 'USA',
      city: i % 2 === 0 ? 'Medellin' : 'Miami',
      createdAt: new Date().toISOString(),
    };

    await collection.upsert(id, customer);
  }

  console.log('Seed completed');

  await disconnect();
}

main().catch(async (error) => {
  console.error(error);

  try {
    await disconnect();
  } finally {
    process.exit(1);
  }
});