'use strict';

const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');

// When running offline (e.g. serverless-offline), load env from .env and skip Secrets Manager
if (process.env.IS_OFFLINE) {
  // eslint-disable-next-line global-require
  require('dotenv').config();
}

// Lazy import so local non-Lambda runs aren't forced to have AWS SDK configured
let secretsInitPromise = Promise.resolve();

if (!process.env.IS_OFFLINE) {
  secretsInitPromise = (async () => {
    try {
      const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

      const secretId = process.env.SECRETS_ID;
      if (!secretId) {
        console.warn('SECRETS_ID not set; skipping Secrets Manager secret load');
        return;
      }

      console.log('SECRETS_ID in Lambda env:', secretId);

      const client = new SecretsManagerClient({});
      const command = new GetSecretValueCommand({ SecretId: secretId });
      const response = await client.send(command);

      let secretString = response.SecretString;
      if (!secretString && response.SecretBinary) {
        secretString = Buffer.from(response.SecretBinary, 'base64').toString('utf8');
      }

      if (!secretString) {
        console.warn('Secret value is empty for SECRETS_ID=', secretId);
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(secretString);
      } catch (parseErr) {
        console.error('Failed to parse secret JSON from Secrets Manager; leaving process.env unchanged', parseErr);
        return;
      }

      console.log('Secret JSON keys from Secrets Manager:', Object.keys(parsed));

      Object.entries(parsed).forEach(([key, value]) => {
        if (typeof key === 'string' && process.env[key] === undefined) {
          process.env[key] = String(value);
        }
      });

      console.log('After secret load, SUPABASE_URL set?:', !!process.env.SUPABASE_URL);
      console.log('After secret load, SUPABASE_SECRET_KEY set?:', !!process.env.SUPABASE_SECRET_KEY);
    } catch (err) {
      console.error('Error loading secrets from AWS Secrets Manager; proceeding without them', err);
    }
  })();
}

// Lazy-initialized serverless Express app so that routes (and supabaseClient)
// are only required after secrets have been loaded.
let serverlessApp;

function getServerlessApp() {
  if (!serverlessApp) {
    console.log('Before app init, SUPABASE_URL set?:', !!process.env.SUPABASE_URL);
    console.log('Before app init, SUPABASE_SECRET_KEY set?:', !!process.env.SUPABASE_SECRET_KEY);

    const healthRouter = require('../routes/health');
    const profilesRouter = require('../routes/profiles');
    const artistsRouter = require('../routes/artists');
    const followsRouter = require('../routes/userFollowsArtist');
    const eventsRouter = require('../routes/events');
    const ticketTiersRouter = require('../routes/ticketTiers');
    const ordersRouter = require('../routes/orders');
    const queueReservationsRouter = require('../routes/queueReservations');

    const app = express();

    app.use(cors());
    app.use(express.json());

    const api = express.Router();

    api.use('/health', healthRouter);
    api.use('/profiles', profilesRouter);
    api.use('/artists', artistsRouter);
    api.use('/user-follows-artist', followsRouter);
    api.use('/events', eventsRouter);
    api.use('/ticket-tiers', ticketTiersRouter);
    api.use('/orders', ordersRouter);
    api.use('/order-items', ordersRouter); // order items sub-routes live in orders router
    api.use('/queue-reservations', queueReservationsRouter);

    app.use('/v1', api);

    // Generic error handler (same as index.js)
    app.use((err, req, res, next) => {
      // eslint-disable-next-line no-console
      console.error(err);
      res.status(500).json({ code: 500, message: 'Internal server error' });
    });

    serverlessApp = serverless(app);
  }

  return serverlessApp;
}

// Ensure secretsInitPromise is always awaited before handling events
exports.handler = async (event, context) => {
  try {
    await secretsInitPromise;
  } catch (e) {
    // This should not happen because we already catch inside the init, but double-guard
    // eslint-disable-next-line no-console
    console.error('Unexpected error awaiting secretsInitPromise', e);
  }

  const app = getServerlessApp();
  return app(event, context);
};
