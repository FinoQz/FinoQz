const newUserWelcomeTemplate = ({ fullName, email, password }) => `
  <div style="font-family: 'Segoe UI', Roboto, -apple-system, sans-serif; background: linear-gradient(135deg, #f4f6fb 0%, #e8eef8 100%); padding: 40px 20px; min-height: 100vh;">
    
    <div style="max-width: 600px; margin: 0 auto;">
      
      <!-- Header Section with Gradient -->
      <div style="background: linear-gradient(135deg, #253A7B 0%, #1a2a5e 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
        <div style="display:inline-flex; align-items:center; gap:12px; margin-bottom:16px;">
          <img src="https://cdn.jsdelivr.net/gh/FinoQz/logo/finoQz.png" width="56" height="56" alt="FinoQz Logo" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));" />
          <span style="font-size:28px; font-weight:700; color:#fff; letter-spacing:-0.5px;">FinoQz</span>
        </div>
        <h1 style="color: #fff; font-size: 28px; margin: 0; font-weight: 700; letter-spacing: -0.5px;">Welcome to FinoQz</h1>
        <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 8px 0 0; font-weight: 500;">Your Financial Learning Journey Starts Here</p>
      </div>

      <!-- Main Content -->
      <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 10px 40px rgba(37, 58, 123, 0.15);">
        
        <!-- Greeting -->
        <p style="font-size: 16px; color: #333; margin: 0 0 24px; line-height: 1.6;">
          Hi <span style="color: #253A7B; font-weight: 700;">${fullName}</span>,
        </p>

        <p style="font-size: 15px; color: #555; margin: 0 0 20px; line-height: 1.8;">
          Your account has been successfully created by our admin team! 🎉 You're all set to start your journey into financial literacy and master the world of personal finance.
        </p>

        <p style="font-size: 14px; color: #555; margin: 0 0 20px; line-height: 1.8;">
          Please use the credentials below to start login. On your first login attempt, you will be asked to verify email OTP first, then mobile OTP.
        </p>

        <!-- Login Credentials Section -->
        <div style="background: linear-gradient(135deg, #f0f4ff 0%, #f9faff 100%); border-left: 4px solid #253A7B; padding: 24px; border-radius: 12px; margin: 28px 0; border: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #666; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 16px;">Your Login Credentials</p>
          
          <div style="background-color: #fff; padding: 16px; border-radius: 8px; margin-bottom: 12px; border: 1px solid #e0e0e0;">
            <p style="font-size: 12px; color: #666; margin: 0 0 4px; font-weight: 600;">Email Address</p>
            <p style="font-size: 14px; color: #253A7B; margin: 0; font-family: 'Courier New', monospace; font-weight: 500; word-break: break-all;">${email}</p>
          </div>

          <div style="background-color: #fff; padding: 16px; border-radius: 8px; border: 1px solid #e0e0e0;">
            <p style="font-size: 12px; color: #666; margin: 0 0 4px; font-weight: 600;">Temporary Password</p>
            <p style="font-size: 14px; color: #253A7B; margin: 0; font-family: 'Courier New', monospace; font-weight: 500; word-break: break-all;">${password}</p>
          </div>
        </div>

        <!-- Security Notice -->
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="font-size: 13px; color: #92400e; margin: 0; line-height: 1.6;">
            <strong style="color: #d97706;">🔒 Security Tip:</strong> Please change your password immediately after your first login. Use a strong, unique password to protect your account.
          </p>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 28px 0;">
          <a href="https://finoqz.com/landing/auth/user_login/login" style="display: inline-block; background: linear-gradient(135deg, #253A7B 0%, #1a2a5e 100%); color: #fff; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 15px rgba(37, 58, 123, 0.3); transition: all 0.3s ease;">Get Started Now</a>
        </div>

        <!-- Key Features -->
        <div style="background-color: #f9fafc; padding: 24px; border-radius: 12px; margin: 28px 0; border: 1px solid #e5e7eb;">
          <p style="font-size: 14px; font-weight: 700; color: #333; margin: 0 0 16px;">What You Can Do:</p>
          <ul style="margin: 0; padding-left: 20px; list-style-position: inside;">
            <li style="font-size: 14px; color: #555; margin: 8px 0; line-height: 1.6;">📚 Access comprehensive finance learning modules</li>
            <li style="font-size: 14px; color: #555; margin: 8px 0; line-height: 1.6;">🎯 Take demo quizzes and test your knowledge</li>
            <li style="font-size: 14px; color: #555; margin: 8px 0; line-height: 1.6;">🏆 Earn certificates upon course completion</li>
            <li style="font-size: 14px; color: #555; margin: 8px 0; line-height: 1.6;">👥 Join our community of finance enthusiasts</li>
          </ul>
        </div>

        <!-- Support Message -->
        <p style="font-size: 14px; color: #666; margin: 28px 0 0; text-align: center; line-height: 1.8;">
          Have questions? Our support team is here to help. Visit our <a href="https://finoqz.com/landing/pages/contact" style="color: #253A7B; text-decoration: none; font-weight: 600;">Help Center</a> or reach out to us anytime.
        </p>

      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 32px; padding: 20px;">
        <p style="font-size: 12px; color: #888; margin: 8px 0;">
          © ${new Date().getFullYear()} FinoQz. All rights reserved.
        </p>
        <p style="font-size: 11px; color: #aaa; margin: 12px 0 0;">
          <a href="https://finoqz.com/landing/pages/privacy_policy" style="color: #888; text-decoration: none; margin: 0 12px;">Privacy Policy</a> | 
          <a href="https://finoqz.com/landing/pages/tos" style="color: #888; text-decoration: none; margin: 0 12px;">Terms of Service</a>
        </p>
      </div>

    </div>
  </div>
`;

export default newUserWelcomeTemplate;
