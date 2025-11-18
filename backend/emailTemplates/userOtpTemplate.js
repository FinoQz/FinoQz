module.exports = (otp) => `
  <div style="font-family: 'Segoe UI', Roboto, sans-serif; background-color: #f9f9ff; padding: 32px; border-radius: 16px; border: 1px solid #e0e0e0; max-width: 600px; margin: auto;">
    <div style="text-align: center; margin-bottom: 24px;">
      <img src="https://cdn.jsdelivr.net/gh/FinoQz/logo/finoQz.png" width="48" height="48" alt="FinoQz Logo" />
      <h2 style="color: #253A7B; font-size: 22px; margin-top: 12px;">Verify Your Email for FinoQz</h2>
      <p style="color: #666; font-size: 14px;">Use the OTP below to verify your email address and continue signup.</p>
    </div>

    <div style="background-color: #253A7B; color: #fff; font-size: 32px; font-weight: bold; text-align: center; padding: 18px 0; border-radius: 12px; letter-spacing: 3px;">
      ${otp}
    </div>

    <p style="margin-top: 24px; font-size: 14px; color: #555; text-align: center;">
      This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.
    </p>

    <p style="text-align: center; font-size: 12px; color: #999; margin-top: 32px;">
      Welcome to <strong>FinoQz</strong — your gateway to smarter finance.
    </p>
  </div>
`;
