const { createHandler } = require('./utils');
const orderController = require('../../src/controllers/orderController');

const handler = createHandler(async (req, res) => {
  const { method, pathParts } = req;

  if (method === 'POST' && pathParts.length === 0) {
    await orderController.create(req, res);
    return;
  }

  if (method === 'GET') {
    if (pathParts.length === 0) {
      await orderController.listByDate(req, res);
      return;
    } else if (pathParts.length === 1) {
      req.params = { id: pathParts[0] };
      await orderController.getById(req, res);
      return;
    }
  }

  if (method === 'PATCH' && pathParts.length === 2 && pathParts[1] === 'status') {
    req.params = { id: pathParts[0] };
    await orderController.updateStatus(req, res);
    return;
  }

  res.status(404).json({ message: 'Not Found' });
});

exports.handler = handler;

