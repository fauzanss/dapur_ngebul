const { createHandler } = require('./utils');
const menuController = require('../../src/controllers/menuController');

const handler = createHandler(async (req, res) => {
  const { method, pathParts } = req;

  if (method === 'GET') {
    if (pathParts.length > 0 && pathParts[0] === 'categories') {
      await menuController.categories(req, res);
      return;
    } else {
      await menuController.list(req, res);
      return;
    }
  }

  res.status(404).json({ message: 'Not Found' });
});

exports.handler = handler;

