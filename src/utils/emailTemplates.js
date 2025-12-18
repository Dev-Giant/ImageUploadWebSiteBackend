/**
 * Email templates for weekly position updates
 */

export const generateWeeklyPositionEmail = (userData) => {
  const { email, firstName, totalEntries, rank, totalUsers, recentUploads, tagCount } = userData;
  
  const progressPercentage = totalUsers > 0 ? Math.round((1 - (rank / totalUsers)) * 100) : 0;
  const progressBarWidth = Math.min(progressPercentage, 100);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Weekly Sweepstake Position Update</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #D91A2A 0%, #1C2526 100%);
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
      text-align: center;
      margin: -30px -30px 30px -30px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 30px 0;
    }
    .stat-card {
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      border: 2px solid #D4A017;
    }
    .stat-number {
      font-size: 36px;
      font-weight: bold;
      color: #D91A2A;
      margin: 10px 0;
    }
    .stat-label {
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .progress-section {
      margin: 30px 0;
      padding: 20px;
      background-color: #f9f9f9;
      border-radius: 8px;
    }
    .progress-bar-container {
      background-color: #e0e0e0;
      height: 30px;
      border-radius: 15px;
      overflow: hidden;
      margin: 15px 0;
      position: relative;
    }
    .progress-bar {
      background: linear-gradient(90deg, #D91A2A 0%, #D4A017 100%);
      height: 100%;
      width: ${progressBarWidth}%;
      transition: width 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
    }
    .rank-info {
      text-align: center;
      margin: 20px 0;
      font-size: 18px;
    }
    .rank-number {
      font-size: 48px;
      font-weight: bold;
      color: #D91A2A;
      margin: 10px 0;
    }
    .call-to-action {
      background-color: #D4A017;
      color: white;
      padding: 15px 30px;
      text-align: center;
      border-radius: 8px;
      margin: 30px 0;
      text-decoration: none;
      display: inline-block;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      font-size: 12px;
      color: #999;
    }
    .highlight-box {
      background-color: #fff3cd;
      border-left: 4px solid #D4A017;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 Gotta Scan Them All™</h1>
      <p>Weekly Position Update</p>
    </div>
    
    <p>Hi ${firstName || 'there'},</p>
    
    <p>Here's your weekly sweepstake position update! Keep uploading to increase your chances of winning those amazing prizes!</p>
    
    <div class="rank-info">
      <div class="stat-label">Your Current Rank</div>
      <div class="rank-number">#${rank}</div>
      <div style="color: #666; font-size: 14px;">out of ${totalUsers} participants</div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">${totalEntries}</div>
        <div class="stat-label">Total Entries</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${recentUploads || 0}</div>
        <div class="stat-label">This Week's Uploads</div>
      </div>
      ${tagCount > 0 ? `
      <div class="stat-card" style="grid-column: 1 / -1;">
        <div class="stat-number">${tagCount}</div>
        <div class="stat-label">Total Tags in Your Posts</div>
        <div style="font-size: 12px; color: #666; margin-top: 10px;">
          Great job engaging your network! More tags = more visibility!
        </div>
      </div>
      ` : ''}
    </div>
    
    <div class="progress-section">
      <h3 style="margin-top: 0;">Your Progress</h3>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${progressBarWidth}%">
          ${progressPercentage}%
        </div>
      </div>
      <p style="text-align: center; color: #666; font-size: 14px;">
        You're in the top ${progressPercentage}% of participants!
      </p>
    </div>
    
    <div class="highlight-box">
      <strong>💡 Pro Tip:</strong> Upload to all 14 social media platforms to maximize your entries! 
      The more you upload, the better your chances of winning luxury prizes including vehicles, 
      gold bullion, luxury handbags, and vacations!
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/social/facebook" class="call-to-action">
        Upload More Photos Now →
      </a>
    </div>
    
    <div class="footer">
      <p>This is an automated weekly update from Gotta Scan Them All™</p>
      <p>Questions? Contact us at support@gottascanthemall.com</p>
      <p style="margin-top: 20px;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/unsubscribe" style="color: #999;">
          Unsubscribe from weekly emails
        </a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
};

