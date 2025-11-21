const express = require('express');
const { supabase } = require('../supabaseClient');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, per_page = 25, artist_id, city, state, date_from, date_to, q } = req.query;
    const from = (page - 1) * per_page;
    const to = from + Number(per_page) - 1;

    let query = supabase.from('events').select('*', { count: 'exact' }).range(from, to);

    if (artist_id) query = query.eq('artist_id', artist_id);
    if (city) query = query.ilike('city', city);
    if (state) query = query.ilike('state', state);
    if (date_from) query = query.gte('start_datetime', date_from);
    if (date_to) query = query.lte('start_datetime', date_to);
    if (q) query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);

    const { data, error } = await query;
    if (error) return next(error);

    res.json({ items: data || [] });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = req.body;
    const { data, error } = await supabase.from('events').insert(payload).select('*').single();
    if (error) return next(error);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/:event_id', async (req, res, next) => {
  try {
    const { event_id } = req.params;
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('event_id', event_id)
      .single();

    if (error && error.code === 'PGRST116') return res.sendStatus(404);
    if (error) return next(error);
    if (!data) return res.sendStatus(404);

    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.patch('/:event_id', async (req, res, next) => {
  try {
    const { event_id } = req.params;
    const updates = req.body;
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('event_id', event_id)
      .select('*')
      .single();

    if (error && error.code === 'PGRST116') return res.sendStatus(404);
    if (error) return next(error);

    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.delete('/:event_id', async (req, res, next) => {
  try {
    const { event_id } = req.params;
    const { error } = await supabase.from('events').delete().eq('event_id', event_id);
    if (error) return next(error);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
