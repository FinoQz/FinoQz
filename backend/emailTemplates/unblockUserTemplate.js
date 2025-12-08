module.exports = function unblockUserTemplate(name) {
  return `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background:#f4f6fb; padding:40px;">
    <div style="max-width:520px; margin:auto; background:white; border-radius:18px; padding:30px; box-shadow:0 4px 20px rgba(0,0,0,0.08);">

      <!-- Logo -->
      <div style="text-align:center; margin-bottom:25px;">
        <img src="https://cdn.jsdelivr.net/gh/FinoQz/logo/finoQz.png" alt="FinoQz" style="width:48px;" />
      </div>

      <h2 style="color:#253A7B; text-align:center; margin-bottom:10px;">
        Account Unblocked
      </h2>

      <p style="color:#444; font-size:15px; line-height:1.6;">
        Hello <strong>${name}</strong>,
      </p>

      <p style="color:#444; font-size:15px; line-height:1.6;">
        Good news! Your FinoQz account has been 
        <strong style="color:#28a745;">successfully unblocked</strong> and you can now log in again.
      </p>

      <p style="color:#444; font-size:15px; line-height:1.6;">
        If you face any issues accessing your account, feel free to reach out to our support team.
      </p>

      <div style="margin-top:25px; text-align:center;">
        <a href="https://finoqz.com/login"
          style="background:#253A7B; color:white; padding:12px 22px; border-radius:10px; text-decoration:none; font-size:14px;">
          Login Now
        </a>
      </div>

      <p style="margin-top:30px; color:#777; font-size:13px; text-align:center;">
        Regards,<br/>FinoQz Team
      </p>
    </div>
  </div>
  `;
};
