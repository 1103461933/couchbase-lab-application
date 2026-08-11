function createCustomer({
  id,
  name,
  email,
  country,
  city,
}) {
  return {
    type: 'customer',
    id,
    name,
    email,
    country,
    city,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

module.exports = {
  createCustomer,
};