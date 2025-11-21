const express = require('express');
const { supabase } = require('../supabaseClient');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { event_id } = req.query;
    if (!event_id) {
      return res.status(400).json({ code: 400, message: 'event_id is required' });
    }

    const { data, error } = await supabase
      .from('ticket_tiers')
      .select('*')
      .eq('event_id', event_id);

    if (error) return next(error);

    res.json(data || []);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = req.body;
    const { data, error } = await supabase
      .from('ticket_tiers')
      .insert(payload)
      .select('*')
      .single();

    if (error) return next(error);

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

router.patch('/:ticket_tier_id', async (req, res, next) => {
  try {
    const { ticket_tier_id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('ticket_tiers')
      .update(updates)
      .eq('ticket_tier_id', ticket_tier_id)
      .select('*')
      .single();

    if (error && error.code === 'PGRST116') return res.sendStatus(404);
    if (error) return next(error);

    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.delete('/:ticket_tier_id', async (req, res, next) => {
  try {
    const { ticket_tier_id } = req.params;
    const { error } = await supabase
      .from('ticket_tiers')
      .delete()
      .eq('ticket_tier_id', ticket_tier_id);

    if (error) return next(error);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
