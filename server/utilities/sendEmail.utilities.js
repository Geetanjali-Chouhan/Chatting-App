import nodemailer from "nodemailer";

export const sendOtpEmail = async (toEmail, otp) => {
  try {
    const smtpUser = process.env.EMAIL_USER;
    const smtpPass = process.env.EMAIL_PASS;
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;

    console.log(`\n==============================================`);
    console.log(`🔑 [OTP VERIFICATION CODE]`);
    console.log(`📧 Recipient: ${toEmail}`);
    console.log(`🔢 OTP Code : ${otp}`);
    console.log(`⏱️  Valid for: 10 minutes`);
    console.log(`==============================================\n`);

    if (smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const mailOptions = {
        from: `"GupShup Messenger" <${smtpUser}>`,
        to: toEmail,
        subject: `Your Login OTP Code: ${otp}`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; background-color: #0b0f19; border-radius: 16px; padding: 32px; color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.1);">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #818cf8; margin: 0; font-size: 26px; font-weight: 700;">GupShup Messenger</h1>
              <p style="color: #94a3b8; font-size: 14px; margin-top: 6px;">Secure Login Verification</p>
            </div>
            <div style="background: rgba(30, 41, 59, 0.7); border-radius: 12px; padding: 24px; text-align: center; border: 1px solid rgba(255, 255, 255, 0.08);">
              <p style="color: #cbd5e1; font-size: 15px; margin-bottom: 18px;">Your one-time password (OTP) for logging in is:</p>
              <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #a855f7; padding: 12px 24px; background: rgba(168, 85, 247, 0.1); border-radius: 8px; display: inline-block; border: 1px solid rgba(168, 85, 247, 0.3);">
                ${otp}
              </div>
              <p style="color: #94a3b8; font-size: 13px; margin-top: 18px;">This code will expire in <strong>10 minutes</strong>. Please do not share it with anyone.</p>
            </div>
            <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 24px;">If you did not request this login code, you can safely ignore this email.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      return { success: true, sent: true };
    }

    return {
      success: true,
      sent: false,
      note: "SMTP not configured. OTP printed to server terminal and sent for preview.",
    };
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return { success: false, error: error.message };
  }
};

export const sendResetPasswordEmail = async (toEmail, otp) => {
  try {
    const smtpUser = process.env.EMAIL_USER;
    const smtpPass = process.env.EMAIL_PASS;
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;

    console.log(`\n==============================================`);
    console.log(`🔐 [PASSWORD RESET VERIFICATION CODE]`);
    console.log(`📧 Recipient: ${toEmail}`);
    console.log(`🔢 Reset OTP: ${otp}`);
    console.log(`⏱️  Valid for: 15 minutes`);
    console.log(`==============================================\n`);

    if (smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const mailOptions = {
        from: `"GupShup Messenger" <${smtpUser}>`,
        to: toEmail,
        subject: `Your Password Reset Code: ${otp}`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; background-color: #0b0f19; border-radius: 16px; padding: 32px; color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.1);">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #818cf8; margin: 0; font-size: 26px; font-weight: 700;">GupShup Messenger</h1>
              <p style="color: #94a3b8; font-size: 14px; margin-top: 6px;">Password Reset Request</p>
            </div>
            <div style="background: rgba(30, 41, 59, 0.7); border-radius: 12px; padding: 24px; text-align: center; border: 1px solid rgba(255, 255, 255, 0.08);">
              <p style="color: #cbd5e1; font-size: 15px; margin-bottom: 18px;">You requested to reset your password. Use the verification code below:</p>
              <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #a855f7; padding: 12px 24px; background: rgba(168, 85, 247, 0.1); border-radius: 8px; display: inline-block; border: 1px solid rgba(168, 85, 247, 0.3);">
                ${otp}
              </div>
              <p style="color: #94a3b8; font-size: 13px; margin-top: 18px;">This code will expire in <strong>15 minutes</strong>. If you did not request this, please ignore this email.</p>
            </div>
            <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 24px;">Security tip: Never share your verification codes with anyone.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      return { success: true, sent: true };
    }

    return {
      success: true,
      sent: false,
      note: "SMTP not configured. Reset code printed to terminal and returned for preview.",
    };
  } catch (error) {
    console.error("Error sending reset email:", error);
    return { success: false, error: error.message };
  }
};
