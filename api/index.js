const express = require('express');
const cors = require('cors');
require('dotenv').config();

const healthRouter = require('./routes/health');
const profilesRouter = require('./routes/profiles');
const artistsRouter = require('./routes/artists');
const followsRouter = require('./routes/userFollowsArtist');
const eventsRouter = require('./routes/events');
const ticketTiersRouter = require('./routes/ticketTiers');
const ordersRouter = require('./routes/orders');
const queueReservationsRouter = require('./routes/queueReservations');

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

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ code: 500, message: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`LowTix API listening on port ${PORT}`);
});
