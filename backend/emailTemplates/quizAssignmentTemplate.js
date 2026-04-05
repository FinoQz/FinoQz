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

const quizAssignmentTemplate = ({
  fullName,
  quizTitle,
  quizDescription,
  visibilityLabel,
  assignedVia,
  startAt,
  endAt,
  actionUrl,
}) => `
  <div style="font-family: 'Segoe UI', Roboto, Arial, sans-serif; background: linear-gradient(160deg, #eef2ff 0%, #f8fafc 60%, #eef9ff 100%); padding: 28px 14px;">
    <div style="max-width: 640px; margin: 0 auto; border-radius: 18px; overflow: hidden; box-shadow: 0 18px 55px rgba(37, 58, 123, 0.18); border: 1px solid #dfe7ff; background: #ffffff;">

      <div style="background: linear-gradient(135deg, #253A7B 0%, #1a2a5e 100%); padding: 26px 28px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
          <img src="https://cdn.jsdelivr.net/gh/FinoQz/logo/finoQz.png" width="40" height="40" alt="FinoQz" />
          <div style="font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px;">FinoQz</div>
        </div>
        <div style="color: #ffffff; font-size: 22px; line-height: 1.2; font-weight: 700;">New Quiz Assigned To You</div>
        <div style="color: rgba(255,255,255,0.9); font-size: 12px; margin-top: 6px;">You have been notified because this quiz is now available in your access scope.</div>
      </div>

      <div style="padding: 26px 28px; color: #1f2937;">
        <p style="margin: 0 0 14px; font-size: 14px; line-height: 1.7;">Hi <strong style="color: #253A7B;">${fullName || 'Learner'}</strong>,</p>
        <p style="margin: 0 0 18px; font-size: 14px; line-height: 1.7; color: #4b5563;">
          A quiz has been assigned to you on FinoQz. Please review the details below and start when ready.
        </p>

        <div style="background: linear-gradient(145deg, #f9fbff 0%, #f3f7ff 100%); border: 1px solid #dfe8ff; border-radius: 12px; padding: 16px; margin-bottom: 18px;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.6px; color: #64748b; font-weight: 700; margin-bottom: 8px;">Quiz Details</div>
          <div style="font-size: 17px; color: #0f172a; font-weight: 700; margin-bottom: 8px;">${quizTitle || 'Untitled Quiz'}</div>
          <div style="font-size: 13px; color: #475569; line-height: 1.7; margin-bottom: 12px;">${quizDescription || 'No description was provided for this quiz.'}</div>

          <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 130px;">Visibility</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${visibilityLabel}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Assigned Via</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${assignedVia}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Starts</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${formatDate(startAt)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Ends</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${formatDate(endAt)}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 20px 0 6px;">
          <a href="${actionUrl}" style="display: inline-block; text-decoration: none; background: linear-gradient(135deg, #253A7B 0%, #1f3270 100%); color: #ffffff; padding: 12px 26px; border-radius: 10px; font-size: 13px; font-weight: 700; letter-spacing: 0.2px;">Open Quiz Dashboard</a>
        </div>

        <p style="margin: 18px 0 0; font-size: 12px; color: #64748b; line-height: 1.7; text-align: center;">
          If this assignment does not look correct, please contact your admin team.
        </p>
      </div>

      <div style="padding: 14px 20px; background: #f8fafc; border-top: 1px solid #e5e7eb; text-align: center; font-size: 11px; color: #94a3b8;">
        © ${new Date().getFullYear()} FinoQz. All rights reserved.
      </div>
    </div>
  </div>
`;

export default quizAssignmentTemplate;
