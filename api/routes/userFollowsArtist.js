const express = require('express');
const { supabase } = require('../supabaseClient');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { artist_id, user_id } = req.body;
    const payload = { artist_id, user_id };
    const { data, error } = await supabase
      .from('user_follows_artist')
      .insert(payload)
      .select('*')
      .single();

    if (error && error.code === '23505') {
      return res.status(409).json({ code: 409, message: 'Already following' });
    }
    if (error) return next(error);

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

router.delete('/', async (req, res, next) => {
  try {
    const { artist_id, user_id } = req.query;

    const { error } = await supabase
      .from('user_follows_artist')
      .delete()
      .match({ artist_id, user_id });

    if (error) return next(error);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
