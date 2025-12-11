import { pool } from '../config/db.js';

/**
 * Generate next entry number and store in the database.
 * Format: COUNTRY-CITY-WAVE-000001
 */
export const createSweepstakeEntry = async (userId, drawInfo) => {
  const { country, city, wave } = drawInfo;

  // Find or create draw
  const { rows } = await pool.query(
    'SELECT * FROM draws WHERE country=$1 AND city=$2 AND wave=$3',
    [country, city, wave]
  );
  let draw = rows[0];

  if (!draw) {
    const insert = await pool.query(
      'INSERT INTO draws (name, country, city, wave, next_number) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [`${country}-${city}-${wave}`, country, city, wave, 1]
    );
    draw = insert.rows[0];
  }

  // Format number
  const formattedNumber = String(draw.next_number).padStart(6, '0');
  const entryNumber = `${country}-${city}-${wave}-${formattedNumber}`;

  // Insert entry
  await pool.query(
    'INSERT INTO entries (user_id, draw_id, entry_number) VALUES ($1,$2,$3)',
    [userId, draw.id, entryNumber]
  );

  // Increment next_number
  await pool.query('UPDATE draws SET next_number=next_number+1 WHERE id=$1', [draw.id]);

  return entryNumber;
};
