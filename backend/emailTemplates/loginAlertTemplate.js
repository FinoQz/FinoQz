module.exports = ({ ip, device, time, location }) => `
  <div style="font-family: 'Segoe UI', Roboto, sans-serif; background-color: #f9f9ff; padding: 32px; border-radius: 16px; border: 1px solid #e0e0e0; max-width: 600px; margin: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    
    <div style="text-align: center; margin-bottom: 24px;">
      <img
  src="https://cdn.jsdelivr.net/gh/FinoQz/logo/finoQz.png" width="48" height="48" alt="FinoQz Logo"
      />
      <h2 style="color: #253A7B; font-size: 22px; margin-top: 12px;">Admin Panel Accessed</h2>
      <p style="color: #666; font-size: 14px;">A login was detected on your FinoQz admin account.</p>
    </div>

    <table style="width: 100%; font-size: 15px; color: #333; border-collapse: collapse; margin-bottom: 16px;">
      <tr>
        <td style="padding: 8px 0; font-weight: 600; width: 40%;">IP Address:</td>
        <td style="padding: 8px 0;">${ip}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: 600;">Device:</td>
        <td style="padding: 8px 0;">${device}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: 600;">Time:</td>
        <td style="padding: 8px 0;">${time}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: 600;">Location:</td>
        <td style="padding: 8px 0;">${location}</td>
      </tr>
    </table>

    <div style="margin-top: 24px; background-color: #fff8f0; padding: 16px; border-radius: 12px; border: 1px solid #f5d0a9;">
      <p style="color: #a94442; font-size: 14px; margin: 0; text-align: center;">
        <strong>If this wasn't you</strong>, please secure your account immediately by resetting your password and contacting support.
      </p>
    </div>

    <p style="text-align: center; font-size: 12px; color: #999; margin-top: 32px;">
      This is an automated alert from <strong>FinoQz Security System</strong>.
    </p>
  </div>
`;
