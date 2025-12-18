import { pool } from '../config/db.js';
import { sendEmail } from '../utils/mailer.js';
import { generateWeeklyPositionEmail } from '../utils/emailTemplates.js';

/**
 * Send weekly position update emails to all users
 * This can be triggered manually or scheduled via cron
 */
export const sendWeeklyEmails = async (req, res) => {
  try {
    // Get all users with their entry statistics
    const usersQuery = `
      SELECT 
        u.id,
        u.email,
        up.first_name,
        COUNT(DISTINCT e.id) as total_entries,
        COUNT(DISTINCT upld.id) FILTER (WHERE upld.created_at >= NOW() - INTERVAL '7 days') as recent_uploads,
        COALESCE(SUM(upld.tag_count), 0) as tag_count
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN entries e ON u.id = e.user_id
      LEFT JOIN uploads upld ON u.id = upld.user_id
      WHERE u.role = 'user'
      GROUP BY u.id, u.email, up.first_name
      HAVING COUNT(DISTINCT e.id) > 0
    `;

    const { rows: users } = await pool.query(usersQuery);
    
    // Get total number of users for ranking
    const totalUsersResult = await pool.query(`
      SELECT COUNT(DISTINCT user_id) as count 
      FROM entries
    `);
    const totalUsers = parseInt(totalUsersResult.rows[0]?.count || 0);

    // Get ranks for each user
    const rankQuery = `
      SELECT 
        user_id,
        COUNT(*) as entry_count,
        ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as rank
      FROM entries
      GROUP BY user_id
      ORDER BY entry_count DESC
    `;
    const { rows: rankedUsers } = await pool.query(rankQuery);
    
    const rankMap = new Map();
    rankedUsers.forEach(row => {
      rankMap.set(row.user_id, parseInt(row.rank));
    });

    let successCount = 0;
    let failureCount = 0;
    const errors = [];

    // Send email to each user
    for (const user of users) {
      try {
        const rank = rankMap.get(user.id) || totalUsers + 1;
        
        const emailHtml = generateWeeklyPositionEmail({
          email: user.email,
          firstName: user.first_name,
          totalEntries: parseInt(user.total_entries || 0),
          rank: rank,
          totalUsers: totalUsers,
          recentUploads: parseInt(user.recent_uploads || 0),
          tagCount: parseInt(user.tag_count || 0)
        });

        await sendEmail(
          user.email,
          '🎯 Your Weekly Sweepstake Position Update - Gotta Scan Them All™',
          emailHtml
        );
        
        successCount++;
      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error);
        failureCount++;
        errors.push({ email: user.email, error: error.message });
      }
    }

    res.json({
      message: 'Weekly emails sent',
      totalUsers: users.length,
      successCount,
      failureCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    console.error('Error sending weekly emails:', err);
    res.status(500).json({ error: 'Failed to send weekly emails', details: err.message });
  }
};

/**
 * Send email to a specific user (for testing)
 */
export const sendTestEmail = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user data
    const userQuery = `
      SELECT 
        u.id,
        u.email,
        up.first_name,
        COUNT(DISTINCT e.id) as total_entries,
        COUNT(DISTINCT upld.id) FILTER (WHERE upld.created_at >= NOW() - INTERVAL '7 days') as recent_uploads,
        COALESCE(SUM(upld.tag_count), 0) as tag_count
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN entries e ON u.id = e.user_id
      LEFT JOIN uploads upld ON u.id = upld.user_id
      WHERE u.id = $1
      GROUP BY u.id, u.email, up.first_name
    `;
    
    const { rows: users } = await pool.query(userQuery, [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    
    // Get total users and rank
    const totalUsersResult = await pool.query(`
      SELECT COUNT(DISTINCT user_id) as count 
      FROM entries
    `);
    const totalUsers = parseInt(totalUsersResult.rows[0]?.count || 0);

    const rankQuery = `
      SELECT 
        user_id,
        COUNT(*) as entry_count,
        ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as rank
      FROM entries
      WHERE user_id = $1
      GROUP BY user_id
    `;
    const { rows: ranked } = await pool.query(rankQuery, [userId]);
    const rank = ranked.length > 0 ? parseInt(ranked[0].rank) : totalUsers + 1;

    const emailHtml = generateWeeklyPositionEmail({
      email: user.email,
      firstName: user.first_name,
      totalEntries: parseInt(user.total_entries || 0),
      rank: rank,
      totalUsers: totalUsers,
      recentUploads: parseInt(user.recent_uploads || 0),
      tagCount: parseInt(user.tag_count || 0)
    });

    await sendEmail(
      user.email,
      '🎯 Your Weekly Sweepstake Position Update - Gotta Scan Them All™',
      emailHtml
    );

    res.json({ message: 'Test email sent successfully', email: user.email });
  } catch (err) {
    console.error('Error sending test email:', err);
    res.status(500).json({ error: 'Failed to send test email', details: err.message });
  }
};

