import nodemailer from 'nodemailer';

export const sendPasswordResetEmail = async (options) => {
  // 1) สร้าง Transporter
  const port = Number(process.env.EMAIL_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,          // smtp.gmail.com
    port,                                  // 465 (SSL) หรือ 587 (TLS)
    secure: port === 465,                  // 465 -> true, 587 -> false
    auth: {
      user: process.env.EMAIL_USERNAME,    // markedza099@gmail.com
      pass: process.env.EMAIL_PASSWORD,    // app password 16 หลัก
    },
  });

  // (ไม่บังคับ) ทดสอบการเชื่อมต่อ SMTP
  try {
    await transporter.verify();
  } catch (e) {
    console.error('SMTP verify failed:', e);
    throw e;
  }

  // 2) สร้าง Base URL ให้ถูกสภาพแวดล้อม
  let baseUrl = 'http://localhost:3000';
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  } else if (process.env.VERCEL_URL) {
    baseUrl = `https://${process.env.VERCEL_URL}`;
  }

  // เส้นทาง URL จริงคือ /reset-password (route group (auth) ไม่ขึ้นใน URL)
  const resetUrl = `${baseUrl}/reset-password?token=${options.token}`;

  console.log('Sending reset email to:', options.to);
  console.log('Reset URL:', resetUrl);
  console.log('Base URL:', baseUrl);

  // 3) เนื้อหาเมล (เพิ่ม text fallback)
  const subject = 'คำขอเปลี่ยนรหัสผ่านสำหรับ IngreCare System';
  const text = `สวัสดีคุณ ${options.name}\n\nคลิกลิงก์เพื่อตั้งรหัสผ่านใหม่:\n${resetUrl}\n\nลิงก์หมดอายุใน 10 นาที`;
  const html = `
    <div style="font-family: 'Sarabun','Kanit',Arial,sans-serif; line-height:1.6; max-width:600px; margin:0 auto; padding:20px;">
      <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); padding:30px; border-radius:10px 10px 0 0; text-align:center;">
        <h1 style="color:#fff; margin:0; font-size:28px;">IngreCare System</h1>
      </div>
      <div style="background:#fff; padding:30px; border:1px solid #e0e0e0; border-top:none; border-radius:0 0 10px 10px;">
        <h2 style="color:#333; margin-top:0;">สวัสดีคุณ ${options.name}</h2>
        <p style="color:#555;">เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</p>
        <p style="color:#555;">กรุณาคลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่</p>
        <div style="text-align:center; margin:30px 0;">
          <a href="${resetUrl}" style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); color:#fff; padding:15px 40px; text-decoration:none; border-radius:25px; display:inline-block; font-weight:bold; font-size:16px; box-shadow:0 4px 15px rgba(102,126,234,.4);">
            ตั้งรหัสผ่านใหม่
          </a>
        </div>
        <div style="background:#fff3cd; border-left:4px solid #ffc107; padding:15px; border-radius:5px;">
          <p style="margin:0; color:#856404; font-size:14px;">
            <strong>⚠️ สำคัญ:</strong> ลิงก์นี้จะหมดอายุใน <strong>10 นาที</strong>
          </p>
        </div>
        <p style="color:#777; font-size:14px; margin-top:30px;">หากปุ่มไม่ทำงาน ให้คัดลอกลิงก์นี้:</p>
        <p style="color:#667eea; font-size:12px; word-break:break-all; background:#f5f5f5; padding:10px; border-radius:5px;">
          ${resetUrl}
        </p>
        <hr style="border:none; border-top:1px solid #e0e0e0; margin:30px 0;">
        <p style="color:#999; font-size:13px; margin:0;">หากคุณไม่ได้เป็นผู้ร้องขอ โปรดเพิกเฉยต่ออีเมลนี้</p>
        <p style="color:#555; font-size:14px; margin-top:20px;">ขอบคุณครับ<br><strong>ทีมงาน IngreCare System</strong></p>
      </div>
      <div style="text-align:center; padding:20px; color:#999; font-size:12px;">
        <p>© ${new Date().getFullYear()} IngreCare System. All rights reserved.</p>
      </div>
    </div>
  `;

  // 4) ส่งอีเมล
  const info = await transporter.sendMail({
    from: `IngreCare <${process.env.EMAIL_FROM}>`,
    to: options.to,
    subject,
    text, // สำคัญ: เพิ่ม text เสมอ
    html, // และมี html
  });

  console.log('Email sent successfully:', info.messageId);
  return info;
};
