const adminResponseTemplate = ({ name, originalMessage, replyMessage }) => `
<div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7fa; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #253A7B 0%, #1a2a5e 100%); padding: 35px 30px; text-align: center;">
      <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Support Reply from FinoQz</h2>
      <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 15px;">Regarding your recent inquiry</p>
    </div>
    
    <div style="padding: 40px 30px;">
      <p style="font-size: 17px; color: #1e293b; margin: 0 0 24px; font-weight: 600;">Hi ${name},</p>
      <p style="font-size: 16px; color: #334155; margin: 0 0 30px; line-height: 1.7; border-left: 4px solid #253A7B; padding-left: 20px;">${replyMessage}</p>
      
      <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 12px;">Your Original Inquiry</p>
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; color: #64748b; font-size: 14px; font-style: italic;">
          "${originalMessage}"
        </div>
      </div>
      
      <p style="margin-top: 40px; font-size: 15px; color: #64748b;">Best regards,<br><strong style="color: #253A7B;">The FinoQz Support Team</strong></p>
    </div>
    
    <div style="background-color: #f1f5f9; padding: 25px; text-align: center; font-size: 12px; color: #94a3b8;">
      <p style="margin: 0 0 8px;">© ${new Date().getFullYear()} FinoQz. All rights reserved.</p>
      <p style="margin: 0;">If you have further questions, please reply to this email or visit our website.</p>
    </div>
  </div>
</div>
`;

export default adminResponseTemplate;
