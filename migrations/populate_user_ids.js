const db = require('../config/db');

async function populateUserIds() {
  try {
    // Get all users that have auth_id but no user_id
    const users = await db.query(
      'SELECT * FROM users WHERE auth_id IS NOT NULL AND (user_id IS NULL OR user_id = "")'
    );
    
    console.log(`Found ${users.rows.length} users with missing user_id`);
    
    // Update each user with a user_id based on their auth_id
    for (const user of users.rows) {
      await db.query(
        'UPDATE users SET user_id = $1 WHERE auth_id = $2',
        [user.auth_id, user.auth_id] // Using auth_id as user_id for simplicity
      );
    }
    
    console.log('Successfully populated user_ids');
    
    // Update orders that might have incorrect user_id references
    const updatedOrders = await db.query(`
      UPDATE orders o
      SET user_id = u.user_id
      FROM users u
      WHERE o.user_id = u.auth_id
      RETURNING o.id
    `);
    
    console.log(`Updated ${updatedOrders.rowCount} orders with correct user_id references`);
    
  } catch (error) {
    console.error('Error populating user_ids:', error);
  } finally {
    process.exit(0);
  }
}

populateUserIds();
