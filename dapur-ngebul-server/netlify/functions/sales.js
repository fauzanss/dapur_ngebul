const { createHandler } = require('./utils');
const salesController = require('../../src/controllers/salesController');

const handler = createHandler(async (req, res) => {
  const { method, pathParts } = req;

  if (method === 'GET') {
    if (pathParts.length === 0) {
      await salesController.summary(req, res);
      return;
    } else if (pathParts[0] === 'today') {
      await salesController.today(req, res);
      return;
    } else if (pathParts[0] === 'month-to-date') {
      await salesController.monthToDate(req, res);
      return;
    } else if (pathParts[0] === 'all-time') {
      await salesController.allTime(req, res);
      return;
    } else if (pathParts[0] === 'range') {
      await salesController.range(req, res);
      return;
    }
  }

  res.status(404).json({ message: 'Not Found' });
});

exports.handler = handler;

