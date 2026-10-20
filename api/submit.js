// Vercel Serverless Function: POST /api/submit
// Integrates Supabase database storage & instant Telegram channel notifications

module.exports = async function handler(req, res) {
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
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { name: rawName, email: rawEmail, phone, website, answers } = body;
    const name = typeof rawName === 'string' ? rawName.trim() : rawName;
    const email = typeof rawEmail === 'string' ? rawEmail.trim() : rawEmail;

    if (typeof name !== 'string' || !name.trim() || name.length > 200 ||
        typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        (phone != null && (typeof phone !== 'string' || phone.length > 80)) ||
        (website != null && (typeof website !== 'string' || website.length > 2048)) ||
        (answers != null && (typeof answers !== 'object' || Array.isArray(answers))) ||
        JSON.stringify(answers || {}).length > 10000) {
      return res.status(400).json({ success: false, error: 'Please provide valid contact details.' });
    }

    const leadData = {
      name: name.trim(),
      email: email.trim(),
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
        const escapeHtml = str => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        const answersFormatted = Object.entries(answers || {})
          .map(([q, a]) => `• <b>${escapeHtml(q)}:</b> ${escapeHtml(a)}`)
          .join('\n');

        const messageText = [
          `🚀 <b>New Consultation Request on EmailFlow!</b>`,
          ``,
          `👤 <b>Name:</b> ${escapeHtml(leadData.name)}`,
          `📧 <b>Email:</b> ${escapeHtml(leadData.email)}`,
          `📞 <b>Phone:</b> ${escapeHtml(leadData.phone || 'Not provided')}`,
          `🌐 <b>Website:</b> ${escapeHtml(leadData.website || 'Not provided')}`,
          ``,
          `📊 <b>Quiz Answers:</b>`,
          answersFormatted || '<i>No quiz answers provided</i>',
          ``,
          `⏰ <b>Time:</b> ${new Date().toLocaleString('en-US', { timeZone: 'UTC' })} UTC`
        ].join('\n');

        const tgRes = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: messageText,
            parse_mode: 'HTML'
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

    if (!supabaseSaved && !telegramSent) {
      return res.status(503).json({
        success: false,
        error: 'We could not accept your request. Please try again or email hello@emailflow.uk.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Consultation request received successfully!',
    });

  } catch (error) {
    return res.status(error instanceof SyntaxError ? 400 : 500).json({
      success: false, error: 'Unable to process the consultation request.'
    });
  }
}
