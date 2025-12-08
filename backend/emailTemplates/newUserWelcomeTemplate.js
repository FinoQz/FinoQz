module.exports = ({ fullName, email, password }) => `
  <div style="font-family: 'Segoe UI', Roboto, sans-serif; background-color: #fff; padding: 32px; border-radius: 16px; border: 1px solid #e0e0e0; max-width: 600px; margin: auto;">
    
    <div style="text-align: center; margin-bottom: 24px;">
      <img src="https://cdn.jsdelivr.net/gh/FinoQz/logo/finoQz.png" width="48" height="48" alt="FinoQz Logo" />
      <h2 style="color: #253A7B; font-size: 22px; margin-top: 12px;">Welcome to FinoQz</h2>
    </div>

    <p style="font-size: 14px; color: #555;">
      Hi <strong>${fullName}</strong>, your account has been successfully created by our admin team.
    </p>

    <p style="font-size: 14px; color: #555;">
      You can now log in using the credentials below:
    </p>

    <div style="background-color: #f7f7f7; padding: 16px; border-radius: 12px; margin: 20px 0; border: 1px solid #e0e0e0;">
      <p style="font-size: 14px; color: #333; margin: 6px 0;">
        <strong>Email:</strong> ${email}
      </p>
      <p style="font-size: 14px; color: #333; margin: 6px 0;">
        <strong>Password:</strong> ${password}
      </p>
    </div>

    <p style="font-size: 14px; color: #555;">
      For security reasons, please change your password after logging in.
    </p>

    <p style="font-size: 14px; color: #555;">
      We're excited to have you onboard. Welcome to the FinoQz family!
    </p>

    <p style="text-align: center; font-size: 12px; color: #999; margin-top: 32px;">
      FinoQz User Notification System
    </p>
  </div>
`;
