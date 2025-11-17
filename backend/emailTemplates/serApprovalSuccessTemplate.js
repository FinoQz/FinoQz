module.exports = ({ fullName, email, password }) => `
  <div style="font-family: 'Segoe UI', Roboto, sans-serif; background-color: #f0fff0; padding: 32px; border-radius: 16px; border: 1px solid #cceccc; max-width: 600px; margin: auto;">
    <div style="text-align: center; margin-bottom: 24px;">
      <img src="https://cdn.jsdelivr.net/gh/FinoQz/logo/finoQz.png" width="48" height="48" alt="FinoQz Logo" />
      <h2 style="color: #2e7d32; font-size: 22px; margin-top: 12px;">🎉 Hurray! You're Approved</h2>
    </div>

    <p style="font-size: 14px; color: #555;">
      Hi ${fullName}, your FinoQz account has been approved. You can now log in using the credentials below:
    </p>

    <ul style="font-size: 14px; color: #333; line-height: 1.6;">
      <li><strong>Email:</strong> ${email}</li>
      <li><strong>Password:</strong> ${password}</li>
    </ul>

    <p style="margin-top: 24px; font-size: 14px; color: #555;">
      Welcome aboard! Let’s make finance smarter together.
    </p>

    <p style="text-align: center; font-size: 12px; color: #999; margin-top: 32px;">
      FinoQz Onboarding Team
    </p>
  </div>
`;
