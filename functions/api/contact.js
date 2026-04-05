export async function onRequestPost(context) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const body = await context.request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'All fields are required.' }), {
        status: 400,
        headers,
      });
    }

    // Send via MailChannels (free for Cloudflare Workers/Pages)
    const mailRes = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: 'shivamagra75@gmail.com', name: 'Evid' }],
          },
        ],
        from: {
          email: 'noreply@evid.software',
          name: 'Evid Contact Form',
        },
        reply_to: {
          email,
          name,
        },
        subject: `[Evid] Message from ${name}`,
        content: [
          {
            type: 'text/plain',
            value: `Name: ${name}\nEmail: ${email}\n\n${message}`,
          },
        ],
      }),
    });

    if (!mailRes.ok) {
      const errText = await mailRes.text();
      console.error('MailChannels error:', errText);
      return new Response(JSON.stringify({ error: 'Failed to send email.' }), {
        status: 502,
        headers,
      });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  } catch (err) {
    console.error('Contact form error:', err);
    return new Response(JSON.stringify({ error: 'Server error.' }), {
      status: 500,
      headers,
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
