module.exports = function blockUserTemplate(name) {
  return `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background:#f4f6fb; padding:40px;">
    <div style="max-width:520px; margin:auto; background:white; border-radius:18px; padding:30px; box-shadow:0 4px 20px rgba(0,0,0,0.08);">

      <!-- Logo -->
      <div style="text-align:center; margin-bottom:25px;">
        <img src="https://cdn.jsdelivr.net/gh/FinoQz/logo/finoQz.png" alt="FinoQz" style="width:48px;" />
      </div>

      <h2 style="color:#253A7B; text-align:center; margin-bottom:10px;">
        Account Blocked
      </h2>

      <p style="color:#444; font-size:15px; line-height:1.6;">
        Hello <strong>${name}</strong>,
      </p>

      <p style="color:#444; font-size:15px; line-height:1.6;">
        We want to inform you that your FinoQz account has been 
        <strong style="color:#d9534f;">temporarily blocked</strong> by the admin due to unusual activity or policy violation.
      </p>

      <p style="color:#444; font-size:15px; line-height:1.6;">
        If you believe this action was taken by mistake, please contact our support team.
      </p>

      <div style="margin-top:25px; text-align:center;">
        <a href="https://finoqz.com/support"
          style="background:#253A7B; color:white; padding:12px 22px; border-radius:10px; text-decoration:none; font-size:14px;">
          Contact Support
        </a>
      </div>

      <p style="margin-top:30px; color:#777; font-size:13px; text-align:center;">
        Regards,<br/>FinoQz Team
      </p>
    </div>
  </div>
  `;
};
