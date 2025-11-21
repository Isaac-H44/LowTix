const express = require('express');
const { supabase } = require('../supabaseClient');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, per_page = 25, q } = req.query;
    const from = (page - 1) * per_page;
    const to = from + Number(per_page) - 1;

    let query = supabase.from('artists').select('*', { count: 'exact' }).range(from, to);

    if (q) {
      // assuming functional index on lower(name)
      query = query.ilike('name', `%${q}%`);
    }

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
    const { data, error } = await supabase.from('artists').insert(payload).select('*').single();
    if (error) return next(error);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/:artist_id', async (req, res, next) => {
  try {
    const { artist_id } = req.params;
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .eq('artist_id', artist_id)
      .single();

    if (error && error.code === 'PGRST116') return res.sendStatus(404);
    if (error) return next(error);
    if (!data) return res.sendStatus(404);

    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.patch('/:artist_id', async (req, res, next) => {
  try {
    const { artist_id } = req.params;
    const updates = req.body;
    const { data, error } = await supabase
      .from('artists')
      .update(updates)
      .eq('artist_id', artist_id)
      .select('*')
      .single();

    if (error && error.code === 'PGRST116') return res.sendStatus(404);
    if (error) return next(error);

    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.delete('/:artist_id', async (req, res, next) => {
  try {
    const { artist_id } = req.params;
    const { error } = await supabase.from('artists').delete().eq('artist_id', artist_id);
    if (error) return next(error);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
