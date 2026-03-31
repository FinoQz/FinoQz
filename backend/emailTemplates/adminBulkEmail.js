const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatEmailBody = (rawMessage = '') => {
  const safeMessage = escapeHtml(rawMessage).trim();
  if (!safeMessage) return '';

  // Keep professional paragraph spacing while preserving manual line breaks.
  const paragraphs = safeMessage
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return paragraphs
    .map(
      (paragraph) =>
        `<p style="font-size:16px;color:#444;line-height:1.8;margin:0 0 16px;text-align:left;">${paragraph.replace(/\n/g, '<br/>')}</p>`
    )
    .join('');
};

const adminBulkEmailTemplate = function (message) {
  const formattedBody = formatEmailBody(message);
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
      
      <!-- Logo with Text -->
      <div style="text-align:center; margin-bottom:30px;">
        <div style="display:inline-flex; align-items:center; gap:12px;">
          <img 
            src="https://cdn.jsdelivr.net/gh/FinoQz/logo/finoQz.png" 
            alt="FinoQz Logo" 
            style="width:52px; height:52px;"
          />
          <span style="font-size:24px; font-weight:700; color:#253A7B; letter-spacing:-0.5px;">FinoQz</span>
        </div>
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
      <div style="margin-bottom:25px;">
        ${formattedBody}
      </div>

      <!-- Footer -->
      <div style="
        color:#555;
        font-size:14px;
        margin-top:30px;
        border-top:1px solid #e5e7eb;
        padding-top:20px;
        text-align:center;
      ">
        <p style="margin:0 0 6px;">Regards,</p>
        <p style="margin:0; color:#253A7B; font-weight:700;">FinoQz Team</p>
      </div>

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

export default adminBulkEmailTemplate;
