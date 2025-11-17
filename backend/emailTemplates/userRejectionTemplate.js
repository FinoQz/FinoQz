module.exports = (name) => `
  <div style="font-family: 'Segoe UI', Roboto, sans-serif; background-color: #fff0f0; padding: 32px; border-radius: 16px; border: 1px solid #f5c2c2; max-width: 600px; margin: auto;">
    <div style="text-align: center; margin-bottom: 24px;">
      <img src="https://cdn.jsdelivr.net/gh/FinoQz/logo/finoQz.png" width="48" height="48" alt="FinoQz Logo" />
      <h2 style="color: #c62828; font-size: 22px; margin-top: 12px;">We're Sorry, ${name}</h2>
    </div>

    <p style="font-size: 14px; color: #555;">
      Unfortunately, we are unable to proceed with your account at this time. After careful review, your signup request was not approved.
    </p>

    <p style="margin-top: 16px; font-size: 14px; color: #555;">
      We appreciate your interest in FinoQz and hope to connect again in the future.
    </p>

    <p style="text-align: center; font-size: 12px; color: #999; margin-top: 32px;">
      FinoQz Review Team
    </p>
  </div>
`;
