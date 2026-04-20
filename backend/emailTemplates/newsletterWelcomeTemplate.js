const newsletterWelcomeTemplate = ({ name, token }) => `
<div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #253A7B 0%, #1e3a8a 100%); padding: 50px 30px; text-align: center;">
      <div style="background-color: rgba(255,255,255,0.1); width: 64px; height: 64px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px;">
        <span style="font-size: 32px;">📩</span>
      </div>
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.02em;">Welcome to the Loop!</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 12px 0 0; font-size: 16px;">You're officially a FinoQz Insider.</p>
    </div>
    
    <div style="padding: 40px 35px;">
      <p style="font-size: 18px; color: #1e293b; margin: 0 0 20px; font-weight: 600;">Hi ${name || 'there'},</p>
      <p style="font-size: 16px; color: #475569; margin: 0 0 24px; line-height: 1.6;">We're thrilled to have you with us! Get ready for a weekly dose of financial wisdom, platform updates, and exclusive challenges designed to boost your financial literacy.</p>
      
      <div style="background-color: #f1f5f9; border-radius: 16px; padding: 25px; margin-bottom: 30px;">
        <p style="font-size: 14px; font-weight: 700; color: #253A7B; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.05em;">What's coming your way:</p>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <p style="margin: 0; color: #475569; font-size: 15px;">✅ Expert tips on smart investing</p>
          <p style="margin: 0; color: #475569; font-size: 15px;">✅ New quiz category announcements</p>
          <p style="margin: 0; color: #475569; font-size: 15px;">✅ Community highlights and insights</p>
        </div>
      </div>
      
      <div style="text-align: center;">
        <a href="https://finoqz.com/quizzes" style="display: inline-block; background-color: #253A7B; color: #ffffff; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 10px 20px rgba(37, 58, 123, 0.2);">Start a Quiz Now</a>
      </div>
    </div>
    
    <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="font-size: 12px; color: #94a3b8; margin: 0 0 16px;">© ${new Date().getFullYear()} FinoQz. Elevating financial literacy everywhere.</p>
      <div style="font-size: 11px; color: #cbd5e1;">
        You're receiving this because you subscribed to the FinoQz newsletter.
        <div style="margin-top: 12px;">
          <a href="https://finoqz.com/api/newsletter/unsubscribe?token=${token}" style="color: #253A7B; text-decoration: underline; font-weight: 600;">Unsubscribe from this list</a>
        </div>
      </div>
    </div>
  </div>
</div>
`;

export default newsletterWelcomeTemplate;
