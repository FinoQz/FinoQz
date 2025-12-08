module.exports = ({ fullName, email }) => `
  <div style="font-family: 'Segoe UI', Roboto, sans-serif; background-color: #fff; padding: 32px; border-radius: 16px; border: 1px solid #e0e0e0; max-width: 600px; margin: auto;">
    <div style="text-align: center; margin-bottom: 24px;">
      <img src="https://cdn.jsdelivr.net/gh/FinoQz/logo/finoQz.png" width="48" height="48" alt="FinoQz Logo" />
      <h2 style="color: #253A7B; font-size: 22px; margin-top: 12px;">Signup Successful</h2>
    </div>

    <p style="font-size: 14px; color: #555;">
      Hi ${fullName}, your account has been successfully created with the email <strong>${email}</strong>.
    </p>

    <p style="font-size: 14px; color: #555;">
      Our team is currently reviewing your details. Once approved, you'll receive a confirmation email and be able to access your dashboard.
    </p>

    <p style="font-size: 14px; color: #555;">
      Thank you for choosing FinoQz. We're excited to have you onboard!
    </p>

    <p style="text-align: center; font-size: 12px; color: #999; margin-top: 32px;">
      FinoQz User Notification System
    </p>
  </div>
`;
