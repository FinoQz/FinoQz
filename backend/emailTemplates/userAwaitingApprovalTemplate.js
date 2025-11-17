module.exports = ({ fullName, email }) =>`
  <div style="font-family: 'Segoe UI', Roboto, sans-serif; background-color: #f9f9ff; padding: 32px; border-radius: 16px; border: 1px solid #e0e0e0; max-width: 600px; margin: auto;">
    <div style="text-align: center; margin-bottom: 24px;">
      <img src="https://cdn.jsdelivr.net/gh/FinoQz/logo/finoQz.png" width="48" height="48" alt="FinoQz Logo" />
      <h2 style="color: #253A7B; font-size: 22px; margin-top: 12px;">Account Created Successfully</h2>
      <p style="color: #666; font-size: 14px;">Hi ${fullName}, your ${email} account has been created and is now pending admin approval.</p>
    </div>

    <p style="font-size: 14px; color: #555; text-align: center;">
      You will receive an email once your account is approved. Thank you for joining FinoQz!
    </p>

    <p style="text-align: center; font-size: 12px; color: #999; margin-top: 32px;">
      Have a great day ahead ✨<br/>— Team FinoQz
    </p>
  </div>
`;
