module.exports = function userDeletedTemplate({ fullName, email }) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Account Deleted</title>

    <style>
      body {
        font-family: Arial, sans-serif;
        background: #f4f6fb;
        margin: 0;
        padding: 0;
      }

      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      }

      .header {
        background: linear-gradient(135deg, #253A7B, #4A6BB5);
        padding: 25px;
        text-align: center;
        color: #ffffff;
      }

      .header img {
        width: 140px;
        margin-bottom: 10px;
      }

      .content {
        padding: 30px;
        color: #333333;
        line-height: 1.6;
      }

      .footer {
        background: #f1f3f9;
        padding: 15px;
        text-align: center;
        font-size: 13px;
        color: #777;
      }

      .btn {
        display: inline-block;
        padding: 12px 22px;
        background: #253A7B;
        color: #ffffff !important;
        text-decoration: none;
        border-radius: 6px;
        margin-top: 20px;
        font-weight: bold;
      }
    </style>
  </head>

  <body>
    <div class="container">

      <div class="header">
        <img src="https://cdn.jsdelivr.net/gh/FinoQz/logo/finoQz.png" alt="FinoQz Logo" width="48" />
        <h2>Your FinoQz Account Has Been Deleted</h2>
      </div>

      <div class="content">
        <p>Hi <strong>${fullName || "User"}</strong>,</p>

        <p>
          This is to inform you that your <strong>FinoQz account</strong> associated with 
          <strong>${email}</strong> has been deleted by the admin.
        </p>

        <p>
          If you believe this action was taken by mistake or you want to restore your account,
          please contact our support team immediately.
        </p>

        <a href="mailto:info.finoqz@gmail.com" class="btn">Contact Support</a>

        <p style="margin-top: 25px;">
          Thank you for being a part of FinoQz.
        </p>
      </div>

      <div class="footer">
        © ${new Date().getFullYear()} FinoQz. All rights reserved.
      </div>

    </div>
  </body>
  </html>
  `;
};
