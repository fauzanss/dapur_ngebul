const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const db = require('../../src/models');

let dbInitialized = false;

async function initDb() {
  if (!dbInitialized) {
    try {
      await db.sequelize.authenticate();
      dbInitialized = true;
    } catch (err) {
      console.error('Failed to connect to database:', err);
      throw err;
    }
  }
  return db;
}

function parseEvent(event) {
  let pathToProcess = event.path;
  let pathParts = [];
  
  if (pathToProcess.startsWith('/.netlify/functions/')) {
    const parts = pathToProcess.split('/.netlify/functions/')[1].split('/').filter(Boolean);
    const functionName = parts[0];
    pathParts = parts.slice(1);
    pathToProcess = '/api/' + (functionName === 'menu' ? 'menu' : functionName === 'orders' ? 'orders' : functionName === 'sales' ? 'sales' : '') + (pathParts.length > 0 ? '/' + pathParts.join('/') : '');
  } else {
    pathParts = pathToProcess.replace(/^\/api\//, '').split('/').filter(Boolean);
  }
  
  const query = event.queryStringParameters || {};
  let body = {};
  
  if (event.body) {
    try {
      body = JSON.parse(event.body);
    } catch (e) {
      body = event.body;
    }
  }
  
  return {
    method: event.httpMethod,
    path: pathToProcess,
    pathParts,
    query,
    body,
    params: {},
  };
}

function createResponse(data, statusCode = 200) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    },
    body: JSON.stringify(data),
  };
}

function createHandler(routeHandler) {
  return async (event, context) => {
    if (event.httpMethod === 'OPTIONS') {
      return createResponse({}, 200);
    }

    try {
      await initDb();
      
      const parsed = parseEvent(event);
      let netlifyResponse = null;
      
      const res = {
        json: (data) => {
          netlifyResponse = createResponse(data, 200);
          return netlifyResponse;
        },
        status: (code) => ({
          json: (data) => {
            netlifyResponse = createResponse(data, code);
            return netlifyResponse;
          },
        }),
      };

      await routeHandler(parsed, res);
      
      if (netlifyResponse) {
        return netlifyResponse;
      }
      
      return createResponse({ message: 'Handler did not return response' }, 500);
    } catch (err) {
      console.error('Handler error:', err);
      return createResponse(
        { message: 'Internal Server Error', error: String(err) },
        500
      );
    }
  };
}

module.exports = {
  initDb,
  parseEvent,
  createResponse,
  createHandler,
};

