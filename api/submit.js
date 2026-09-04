// Vercel Serverless Function: POST /api/submit
// Integrates Supabase database storage & instant Telegram channel notifications

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, website, answers } = req.body || {};

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and Email are required.' });
    }

    const leadData = {
      name: name || '',
      email: email || '',
      phone: phone || '',
      website: website || '',
      answers: answers || {},
      created_at: new Date().toISOString()
    };

    let supabaseSaved = false;
    let telegramSent = false;
    let errors = [];

    // 1. Save to Supabase (if keys configured)
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const sbRes = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/leads`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(leadData)
        });

        if (sbRes.ok) {
          supabaseSaved = true;
        } else {
          const errText = await sbRes.text();
          errors.push(`Supabase error: ${errText}`);
        }
      } catch (err) {
        errors.push(`Supabase fetch exception: ${err.message}`);
      }
    }

    // 2. Send Telegram Channel Notification (if bot token configured)
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;

    if (telegramToken && telegramChatId) {
      try {
        const answersFormatted = Object.entries(answers || {})
          .map(([q, a]) => `• *${q}:* ${a}`)
          .join('\n');

        const messageText = [
          `🚀 *New Consultation Request on EmailFlow!*`,
          ``,
          `👤 *Name:* ${leadData.name}`,
          `📧 *Email:* ${leadData.email}`,
          `📞 *Phone:* ${leadData.phone || 'Not provided'}`,
          `🌐 *Website:* ${leadData.website || 'Not provided'}`,
          ``,
          `📊 *Quiz Answers:*`,
          answersFormatted || '_No quiz answers provided_',
          ``,
          `⏰ *Time:* ${new Date().toLocaleString('en-US', { timeZone: 'UTC' })} UTC`
        ].join('\n');

        const tgRes = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: messageText,
            parse_mode: 'Markdown'
          })
        });

        if (tgRes.ok) {
          telegramSent = true;
        } else {
          const tgErr = await tgRes.text();
          errors.push(`Telegram error: ${tgErr}`);
        }
      } catch (err) {
        errors.push(`Telegram fetch exception: ${err.message}`);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Consultation request received successfully!',
      supabaseSaved,
      telegramSent,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Submission Handler Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
