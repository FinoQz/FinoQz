module.exports = function adminBulkEmailTemplate(message) {
  return `
  <div style="background:#f4f6fb; padding:40px 0; font-family:Arial, sans-serif;">
    <div style="
      max-width:600px;
      margin:0 auto;
      background:#ffffff;
      border-radius:12px;
      padding:30px 40px;
      box-shadow:0 4px 20px rgba(0,0,0,0.08);
      border:1px solid #e5e7eb;
    ">
      
      <!-- Logo -->
      <div style="text-align:center; margin-bottom:25px;">
        <img 
          src="https://cdn.jsdelivr.net/gh/FinoQz/logo/finoQz.png" 
          alt="FinoQz Logo" 
          style="width:48px; height:auto;"
        />
      </div>

      <!-- Header -->
      <h2 style="
        color:#253A7B;
        font-size:24px;
        margin:0 0 15px;
        text-align:center;
        font-weight:700;
      ">
        Message from FinoQz
      </h2>

      <!-- Divider -->
      <div style="
        width:60px;
        height:4px;
        background:#253A7B;
        margin:10px auto 25px;
        border-radius:2px;
      "></div>

      <!-- Message Body -->
      <p style="
        font-size:16px;
        color:#444;
        line-height:1.7;
        margin-bottom:25px;
      ">
        ${message}
      </p>

      <!-- Footer -->
      <p style="
        color:#555;
        font-size:14px;
        margin-top:30px;
        border-top:1px solid #e5e7eb;
        padding-top:20px;
        text-align:center;
      ">
        Regards,<br/>
        <strong style="color:#253A7B;">FinoQz Team</strong>
      </p>

    </div>

    <!-- Bottom Note -->
    <p style="
      text-align:center;
      font-size:12px;
      color:#888;
      margin-top:20px;
    ">
      © ${new Date().getFullYear()} FinoQz. All rights reserved.
    </p>
  </div>
  `;
};
