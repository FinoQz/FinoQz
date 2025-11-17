module.exports = ({ fullName, email, mobile, location }) => `
  <div style="font-family: 'Segoe UI', Roboto, sans-serif; background-color: #fff; padding: 32px; border-radius: 16px; border: 1px solid #e0e0e0; max-width: 600px; margin: auto;">
    <div style="text-align: center; margin-bottom: 24px;">
      <img src="https://cdn.jsdelivr.net/gh/FinoQz/logo/finoQz.png" width="48" height="48" alt="FinoQz Logo" />
      <h2 style="color: #253A7B; font-size: 22px; margin-top: 12px;">New User Signup Request</h2>
    </div>

    <p style="font-size: 14px; color: #555;">
      A new user has completed signup and is awaiting approval:
    </p>

    <ul style="font-size: 14px; color: #333; line-height: 1.6;">
      <li><strong>Name:</strong> ${fullName}</li>
      <li><strong>Email:</strong> ${email}</li>
      <li><strong>Mobile:</strong> ${mobile}</li>
      <li><strong>Location:</strong> ${location || 'Not captured'}</li>
    </ul>

    <p style="margin-top: 24px; font-size: 14px; color: #555;">
      Please review and approve/reject this request from your admin panel.
    </p>

    <p style="text-align: center; font-size: 12px; color: #999; margin-top: 32px;">
      FinoQz Admin Notification System
    </p>
  </div>
`;
