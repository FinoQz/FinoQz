module.exports = function userDeletedTemplate({ fullName = "User", email = "your account" }) {
  return `
  <div style="font-family: 'Segoe UI', Roboto, sans-serif; background-color: #f9f9ff; padding: 32px; border-radius: 16px; border: 1px solid #e0e0e0; max-width: 600px; margin: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">

    <div style="text-align: center; margin-bottom: 24px;">
      <img
        src="https://cdn.jsdelivr.net/gh/FinoQz/logo/finoQz.png"
        width="48"
        height="48"
        alt="FinoQz Logo"
      />
      <h2 style="color: #253A7B; font-size: 22px; margin-top: 12px;">Your FinoQz Account Has Been Deleted</h2>
      <p style="color: #666; font-size: 14px;">This is to inform you that your account has been removed.</p>
    </div>

    <div style="background-color: #fff; padding: 24px; border-radius: 12px; color: #333; font-size: 15px; line-height: 1.6;">
      <p>Hi <strong>${fullName}</strong>,</p>

      <p>
        Your <strong>FinoQz account</strong> associated with <strong>${email}</strong> has been deleted by the admin.
      </p>

      <p>
        If you believe this was a mistake or would like to request account restoration,
        please contact our support team.
      </p>

      <div style="text-align: center; margin-top: 24px;">
        <a href="mailto:info.finoqz@gmail.com" style="display: inline-block; padding: 12px 22px; background-color: #253A7B; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Contact Support
        </a>
      </div>

      <p style="margin-top: 32px; text-align: center; font-size: 14px; color: #555;">
        Thank you for being a part of the FinoQz community.
      </p>
    </div>

    <p style="text-align: center; font-size: 12px; color: #999; margin-top: 32px;">
      © ${new Date().getFullYear()} FinoQz. All rights reserved.
    </p>
  </div>
  `;
};
