const express = require('express');
const { supabase } = require('../supabaseClient');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, per_page = 25, role } = req.query;
    const from = (page - 1) * per_page;
    const to = from + Number(per_page) - 1;

    let query = supabase.from('profiles').select('*', { count: 'exact' }).range(from, to);

    if (role) {
      query = query.eq('role', role);
    }

    const { data, error } = await query;

    if (error) return next(error);

    res.json({
      items: data || [],
      page: Number(page),
      per_page: Number(per_page),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = req.body;
    const { data, error } = await supabase.from('profiles').upsert(payload).select('*').single();
    if (error) return next(error);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/:user_id', async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const { data, error } = await supabase.from('profiles').select('*').eq('user_id', user_id).single();
    if (error && error.code === 'PGRST116') return res.sendStatus(404);
    if (error) return next(error);
    if (!data) return res.sendStatus(404);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.patch('/:user_id', async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const updates = req.body;
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user_id)
      .select('*')
      .single();

    if (error && error.code === 'PGRST116') return res.sendStatus(404);
    if (error) return next(error);

    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.delete('/:user_id', async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const { error } = await supabase.from('profiles').delete().eq('user_id', user_id);
    if (error) return next(error);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
