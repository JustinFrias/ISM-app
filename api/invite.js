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

  const cleanEmail = email.trim().toLowerCase();
  const targetRole = role || 'STAFF';
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;

  if (!clerkSecretKey) {
    return res.status(200).json({
      success: true,
      simulated: true,
      message: `Invitation email queued for ${cleanEmail}. (CLERK_SECRET_KEY not set)`,
    });
  }

  const authHeader = {
    'Authorization': `Bearer ${clerkSecretKey}`,
    'Content-Type': 'application/json',
  };

  try {
    // 1. Try to create an invitation
    const clerkRes = await fetch('https://api.clerk.com/v1/invitations', {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({
        email_address: cleanEmail,
        public_metadata: {
          role: targetRole,
        },
        redirect_url: redirectUrl || 'https://akinto.vercel.app',
      }),
    });

    const data = await clerkRes.json();

    if (clerkRes.ok) {
      return res.status(200).json({
        success: true,
        invitation: data,
        message: `Invitation email sent successfully to ${cleanEmail}. Check Inbox or Spam.`,
      });
    }

    const firstError = data.errors?.[0]?.message || '';

    // 2. Case: The email address is already a registered user in Clerk
    if (firstError.toLowerCase().includes('taken') || firstError.toLowerCase().includes('already')) {
      // Find the user and update their role to the target role
      const userSearchRes = await fetch(
        `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(cleanEmail)}`,
        { headers: authHeader }
      );
      const userList = await userSearchRes.json();

      if (Array.isArray(userList) && userList.length > 0) {
        const userId = userList[0].id;
        // Update public metadata role
        await fetch(`https://api.clerk.com/v1/users/${userId}/metadata`, {
          method: 'PATCH',
          headers: authHeader,
          body: JSON.stringify({
            public_metadata: {
              role: targetRole,
            },
          }),
        });

        return res.status(200).json({
          success: true,
          alreadyRegistered: true,
          message: `Ang ${cleanEmail} ay nakarehistro na sa Clerk! Na-set na ang role niya bilang ${targetRole}. Pwede na siyang mag-login diretso sa app.`,
        });
      }
    }

    // If other error occurred
    return res.status(clerkRes.status || 400).json({
      success: false,
      error: firstError || 'Failed to send invitation',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error while sending invitation',
    });
  }
}
