const express = require('express');
const { supabase } = require('../supabaseClient');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const payload = req.body;
    const { data, error } = await supabase
      .from('queue_reservations')
      .insert(payload)
      .select('*')
      .single();

    if (error) return next(error);

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { event_id, user_id } = req.query;

    let query = supabase.from('queue_reservations').select('*');

    if (event_id) query = query.eq('event_id', event_id);
    if (user_id) query = query.eq('user_id', user_id);

    const { data, error } = await query;
    if (error) return next(error);

    res.json(data || []);
  } catch (err) {
    next(err);
  }
});

router.patch('/:queue_reservation_id', async (req, res, next) => {
  try {
    const { queue_reservation_id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('queue_reservations')
      .update(updates)
      .eq('queue_reservation_id', queue_reservation_id)
      .select('*')
      .single();

    if (error && error.code === 'PGRST116') return res.sendStatus(404);
    if (error) return next(error);

    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
