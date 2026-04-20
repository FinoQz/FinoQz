const contactTemplate = ({ name, email, subject, message }) => `
<div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7fa; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #253A7B 0%, #1a2a5e 100%); padding: 30px; text-align: center;">
      <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">New Contact Inquiry</h2>
      <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">A user has reached out through the FinoQz website</p>
    </div>
    
    <div style="padding: 40px 30px;">
      <div style="margin-bottom: 24px;">
        <p style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px;">From</p>
        <p style="font-size: 16px; color: #1e293b; margin: 0; font-weight: 600;">${name}</p>
        <p style="font-size: 14px; color: #64748b; margin: 0;">${email}</p>
      </div>
      
      <div style="margin-bottom: 24px;">
        <p style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px;">Subject</p>
        <p style="font-size: 16px; color: #1e293b; margin: 0; font-weight: 600;">${subject}</p>
      </div>
      
      <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
        <p style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 12px;">Message Original</p>
        <p style="font-size: 15px; color: #334155; margin: 0; line-height: 1.6; white-space: pre-wrap;">${message}</p>
      </div>
      
      <div style="margin-top: 40px; text-align: center;">
        <a href="https://finoqz.com/admin_dash/dashboard" style="display: inline-block; background-color: #253A7B; color: #ffffff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">Review in Admin Panel</a>
      </div>
    </div>
    
    <div style="background-color: #f1f5f9; padding: 20px; text-align: center;">
      <p style="font-size: 12px; color: #94a3b8; margin: 0;">© ${new Date().getFullYear()} FinoQz Admin Alerts. Automated notification.</p>
    </div>
  </div>
</div>
`;

export default contactTemplate;
