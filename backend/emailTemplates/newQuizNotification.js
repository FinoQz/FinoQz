const formatDate = (value) => {
  if (!value) return 'Not scheduled';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not scheduled';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
    timeZoneName: 'short',
  });
};

const newQuizNotificationTemplate = ({
  fullName,
  quizTitle,
  quizDescription,
  categoryName,
  duration,
  startAt,
  actionUrl,
}) => `
  <div style="font-family: 'Segoe UI', Roboto, Arial, sans-serif; background: linear-gradient(160deg, #f0f4ff 0%, #f8fafc 60%, #f0f9ff 100%); padding: 32px 16px;">
    <div style="max-width: 600px; margin: 0 auto; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(37, 58, 123, 0.15); border: 1px solid #e2e8f0; background: #ffffff;">

      <!-- Header -->
      <div style="background: linear-gradient(135deg, #253A7B 0%, #1a2a5e 100%); padding: 32px 32px 24px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
          <img src="https://cdn.jsdelivr.net/gh/FinoQz/logo/finoQz.png" width="44" height="44" alt="FinoQz" />
          <div style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">FinoQz</div>
        </div>
        <div style="color: #ffffff; font-size: 26px; line-height: 1.2; font-weight: 800;">New Quiz is Live! 🚀</div>
        <div style="color: rgba(255,255,255,0.85); font-size: 14px; margin-top: 8px; font-weight: 500;">A new assessment has been posted in your dashboard.</div>
      </div>

      <!-- Content -->
      <div style="padding: 32px; color: #1e293b;">
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6;">Hi <strong style="color: #253A7B;">${fullName || 'Learner'}</strong>,</p>
        <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #475569;">
          We're excited to announce that a new quiz "<strong>${quizTitle}</strong>" is now available. Challenge yourself and track your progress today!
        </p>

        <!-- Quiz Details Card -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
          <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 800; margin-bottom: 12px;">Assessment Overview</div>
          
          <div style="font-size: 19px; color: #0f172a; font-weight: 800; margin-bottom: 10px;">${quizTitle}</div>
          <div style="font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 20px;">${quizDescription || 'No description provided.'}</div>

          <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; width: 100px;">Category</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${categoryName || 'General'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Duration</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${duration} Minutes</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Goes Live</td>
              <td style="padding: 8px 0; color: #253A7B; font-weight: 700;">${formatDate(startAt)}</td>
            </tr>
          </table>
        </div>

        <!-- Action Button -->
        <div style="text-align: center; margin: 32px 0 12px;">
          <a href="${actionUrl}" style="display: inline-block; text-decoration: none; background: linear-gradient(135deg, #253A7B 0%, #1f3270 100%); color: #ffffff; padding: 14px 36px; border-radius: 12px; font-size: 15px; font-weight: 700; shadow: 0 4px 12px rgba(37, 58, 123, 0.25);">Start Now</a>
        </div>

        <p style="margin: 24px 0 0; font-size: 13px; color: #94a3b8; line-height: 1.6; text-align: center;">
          Happy learning! Let's conquer this challenge.
        </p>
      </div>

      <!-- Footer -->
      <div style="padding: 20px; background: #f1f5f9; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
        <div style="margin-bottom: 8px;">
          © ${new Date().getFullYear()} FinoQz Learning Platforms.
        </div>
        <div style="color: #94a3b8;">
          You received this email because notifications are enabled in your dashboard.
        </div>
      </div>
    </div>
  </div>
`;

export default newQuizNotificationTemplate;
