import nodemailer from 'nodemailer';

export const sendPasswordResetEmail = async (options) => {
    // 1. สร้าง Transporter (ใช้ข้อมูลจาก .env)
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    // 2. ตรวจสอบและสร้าง URL ที่ถูกต้อง
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${options.token}`;

    console.log('Sending reset email to:', options.to);
    console.log('Reset URL:', resetUrl);

    // 3. กำหนดรายละเอียดอีเมล
    const mailOptions = {
        from: `IngreCare <${process.env.EMAIL_FROM}>`,
        to: options.to,
        subject: 'คำขอเปลี่ยนรหัสผ่านสำหรับ IngreCare System',
        html: `
            <div style="font-family: 'Sarabun', 'Kanit', Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">IngreCare System</h1>
                </div>
                
                <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333; margin-top: 0;">สวัสดีคุณ ${options.name}</h2>
                    
                    <p style="color: #555; font-size: 16px;">เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</p>
                    
                    <p style="color: #555; font-size: 16px;">กรุณาคลิกที่ปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                  color: white; 
                                  padding: 15px 40px; 
                                  text-decoration: none; 
                                  border-radius: 25px; 
                                  display: inline-block;
                                  font-weight: bold;
                                  font-size: 16px;
                                  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                            ตั้งรหัสผ่านใหม่
                        </a>
                    </div>
                    
                    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
                        <p style="margin: 0; color: #856404; font-size: 14px;">
                            <strong>⚠️ สำคัญ:</strong> ลิงก์นี้จะหมดอายุใน <strong>10 นาที</strong>
                        </p>
                    </div>
                    
                    <p style="color: #777; font-size: 14px; margin-top: 30px;">
                        หากปุ่มด้านบนไม่ทำงาน กรุณาคัดลอกลิงก์ด้านล่างและวางในเบราว์เซอร์:
                    </p>
                    <p style="color: #667eea; font-size: 12px; word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 5px;">
                        ${resetUrl}
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                    
                    <p style="color: #999; font-size: 13px; margin-bottom: 0;">
                        หากคุณไม่ได้เป็นผู้ร้องขอ โปรดเพิกเฉยต่ออีเมลฉบับนี้ รหัสผ่านของคุณจะยังคงปลอดภัย
                    </p>
                    
                    <p style="color: #555; font-size: 14px; margin-top: 20px;">
                        ขอบคุณครับ,<br/>
                        <strong>ทีมงาน IngreCare System</strong>
                    </p>
                </div>
                
                <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                    <p>© ${new Date().getFullYear()} IngreCare System. All rights reserved.</p>
                </div>
            </div>
        `,
    };

    // 4. ส่งอีเมล
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};