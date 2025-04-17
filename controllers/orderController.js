const db = require('../db');

const createOrder = async (req, res) => {
  try {
    const { products, shipping, payment } = req.body;
    
    // Get the correct user_id from the database using auth_id from the request
    const userResult = await db.query(
      'SELECT user_id FROM users WHERE auth_id = $1',
      [req.user.auth_id] // Assuming auth info is in req.user
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userId = userResult.rows[0].user_id;
    
    // Create order with the correct user_id
    const orderResult = await db.query(
      'INSERT INTO orders (user_id, ...) VALUES ($1, ...) RETURNING *',
      [userId, ...]
    );
    
    res.status(201).json(orderResult.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
};

module.exports = {
  createOrder,
};