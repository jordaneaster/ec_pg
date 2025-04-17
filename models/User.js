const db = require('../db');

// During user creation, ensure user_id is set
const createUser = async (userData) => {
  // If no user_id is provided, use auth_id as user_id
  if (!userData.user_id && userData.auth_id) {
    userData.user_id = userData.auth_id;
  }
  
  const result = await db.query(
    'INSERT INTO users (user_id, auth_id, email, name, ...) VALUES ($1, $2, $3, $4, ...) RETURNING *',
    [userData.user_id, userData.auth_id, userData.email, userData.name, ...]
  );
  
  return result.rows[0];
};

module.exports = {
  createUser,
};