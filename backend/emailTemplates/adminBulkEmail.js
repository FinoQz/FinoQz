const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/**
 * Premium Minimalist Template for Campaigns
 * Note: Message body is now EXPECTED to be HTML from the Rich Text Editor.
 * Sanitization should happen on the frontend/controller if necessary.
 */
const adminBulkEmailTemplate = function ({ message, heroImage, ctaText, ctaUrl }) {
  // We no longer escape the body because it comes from the Rich Text Editor (HTML)
  const safeBody = message || '';
  
  const heroSection = heroImage ? `
    <tr>
      <td style="padding:0; border-radius:16px 16px 0 0; overflow:hidden;">
        <img src="${heroImage}" alt="Banner" style="width:100%; max-width:600px; display:block; height:auto; border:0;">
      </td>
    </tr>
  ` : '';

  const ctaSection = (ctaText && ctaUrl) ? `
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:24px 0;">
      <tr>
        <td align="center">
          <a href="${ctaUrl}" target="_blank" style="
            background-color: #2563eb;
            color: #ffffff;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 600;
            font-size: 15px;
            display: inline-block;
          ">
            ${escapeHtml(ctaText)}
          </a>
        </td>
      </tr>
    </table>
  ` : '';

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0;padding:0;background-color:#F9FAFB;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;-webkit-font-smoothing:antialiased;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#F9FAFB;padding:40px 20px;">
      <tr>
        <td align="center">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #F3F4F6;">
            
            <!-- Banner -->
            ${heroSection}

            <!-- Minimal Header -->
            <tr>
              <td style="padding:32px 40px 0;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td>
                      <img src="https://cdn.jsdelivr.net/gh/FinoQz/logo/finoQz.png" alt="FinoQz" style="width:28px;height:28px;vertical-align:middle;">
                      <span style="font-size:16px; font-weight:600; color:#111827; margin-left:8px; vertical-align:middle; letter-spacing:-0.2px;">FinoQz</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Content Area -->
            <tr>
              <td style="padding:24px 40px 40px;">
                <div style="font-size:15px; color:#374151; line-height:1.6; font-family: inherit;">
                  ${safeBody}
                </div>

                ${ctaSection}

                <div style="margin-top:32px; border-top:1px solid #F3F4F6; padding-top:24px;">
                  <p style="margin:0; font-size:13px; color:#6B7280;">Best,</p>
                  <p style="margin:4px 0 0; font-size:14px; color:#111827; font-weight:600;">The FinoQz Team</p>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color:#F9FAFB; padding:24px 40px; text-align:center;">
                <p style="margin:0; font-size:11px; color:#9CA3AF; line-height:1.5;">
                  Official update regarding your relationship with FinoQz.<br>
                  © ${new Date().getFullYear()} FinoQz. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

export default adminBulkEmailTemplate;
