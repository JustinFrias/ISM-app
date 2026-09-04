export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, role, redirectUrl } = req.body || {};

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Valid email address is required' });
  }

  const clerkSecretKey = process.env.CLERK_SECRET_KEY;

  if (!clerkSecretKey) {
    // If not yet available in dev environment, return simulated success
    return res.status(200).json({
      success: true,
      simulated: true,
      message: `Invitation email queued for ${email}. Configure CLERK_SECRET_KEY in Vercel to dispatch live Clerk emails.`,
    });
  }

  try {
    const clerkRes = await fetch('https://api.clerk.com/v1/invitations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${clerkSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email.trim(),
        public_metadata: {
          role: role || 'STAFF',
        },
        redirect_url: redirectUrl || 'https://akinto.vercel.app',
      }),
    });

    const data = await clerkRes.json();

    if (!clerkRes.ok) {
      const errorMsg = data.errors?.[0]?.message || 'Clerk failed to send invitation';
      return res.status(clerkRes.status).json({
        success: false,
        error: errorMsg,
      });
    }

    return res.status(200).json({
      success: true,
      invitation: data,
      message: `Invitation email sent successfully to ${email} with role ${role || 'STAFF'}.`,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error while sending invitation',
    });
  }
}
