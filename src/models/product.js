function createProduct({
  id,
  name,
  category,
  price,
  stock = 0,
}) {
  return {
    type: 'product',
    id,
    name,
    category,
    price,
    stock,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

module.exports = {
  createProduct,
};