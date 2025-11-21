const express = require('express');
const { supabase } = require('../supabaseClient');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, per_page = 25, status } = req.query;
    const from = (page - 1) * per_page;
    const to = from + Number(per_page) - 1;

    let query = supabase.from('orders').select('*', { count: 'exact' }).range(from, to);

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) return next(error);

    res.json({ items: data || [] });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { items, ...orderPayload } = req.body;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select('*')
      .single();

    if (orderError) return next(orderError);

    if (items && items.length) {
      const orderItems = items.map((item) => ({
        order_id: order.order_id,
        ticket_tier_id: item.ticket_tier_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.quantity * item.unit_price,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) return next(itemsError);
    }

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

router.get('/:order_id', async (req, res, next) => {
  try {
    const { order_id } = req.params;
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', order_id)
      .single();

    if (error && error.code === 'PGRST116') return res.sendStatus(404);
    if (error) return next(error);
    if (!data) return res.sendStatus(404);

    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.patch('/:order_id', async (req, res, next) => {
  try {
    const { order_id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('order_id', order_id)
      .select('*')
      .single();

    if (error && error.code === 'PGRST116') return res.sendStatus(404);
    if (error) return next(error);

    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.delete('/:order_id', async (req, res, next) => {
  try {
    const { order_id } = req.params;
    const { error } = await supabase.from('orders').delete().eq('order_id', order_id);
    if (error) return next(error);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

router.post('/items', async (req, res, next) => {
  try {
    const items = req.body;
    const { error } = await supabase.from('order_items').insert(items);
    if (error) return next(error);
    res.status(201).json({});
  } catch (err) {
    next(err);
  }
});

router.get('/items/by-order', async (req, res, next) => {
  try {
    const { order_id } = req.query;
    if (!order_id) {
      return res.status(400).json({ code: 400, message: 'order_id is required' });
    }

    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order_id);

    if (error) return next(error);

    res.json(data || []);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
