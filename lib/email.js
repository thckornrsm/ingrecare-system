// lib/email.js
import nodemailer from 'nodemailer';

/**
 * สร้าง Email Transporter
 */
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
};

/**
 * ฟังก์ชันสำหรับส่งอีเมลรีเซ็ตรหัสผ่าน
 */
export const sendPasswordResetEmail = async (options) => {
    const transporter = createTransporter();

    // สร้าง URL ที่ถูกต้องโดยอัตโนมัติ
    let baseUrl;
    
    if (process.env.NEXT_PUBLIC_BASE_URL) {
        baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    } else if (process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`;
    } else {
        baseUrl = 'http://localhost:3000';
    }

    const resetUrl = `${baseUrl}/reset-password?token=${options.token}`;

    console.log('Sending reset email to:', options.to);
    console.log('Reset URL:', resetUrl);

    const mailOptions = {
        from: `IngreCare <${process.env.EMAIL_FROM}>`,
        to: options.to,
        subject: 'คำขอเปลี่ยนรหัสผ่านสำหรับ IngreCare System',
        text: `
สวัสดีคุณ ${options.name}

เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ

กรุณาคลิกที่ลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่:
${resetUrl}

⚠️ สำคัญ: ลิงก์นี้จะหมดอายุใน 10 นาที

หากคุณไม่ได้เป็นผู้ร้องขอ โปรดเพิกเฉยต่ออีเมลฉบับนี้ รหัสผ่านของคุณจะยังคงปลอดภัย

ขอบคุณครับ,
ทีมงาน IngreCare System

© ${new Date().getFullYear()} IngreCare System. All rights reserved.
        `,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #3FA170; padding: 40px 20px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">IngreCare System</h1>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">สวัสดีคุณ ${options.name}</h2>
                            
                            <p style="margin: 0 0 15px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                                เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ
                            </p>
                            
                            <p style="margin: 0 0 30px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                                กรุณาคลิกที่ปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่:
                            </p>
                            
                            <!-- Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <a href="${resetUrl}" style="display: inline-block; background-color: #3FA170; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 5px; font-size: 16px; font-weight: bold;">
                                            ตั้งรหัสผ่านใหม่
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Warning Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                    <td style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px;">
                                        <p style="margin: 0; color: #856404; font-size: 14px;">
                                            <strong>⚠️ สำคัญ:</strong> ลิงก์นี้จะหมดอายุใน <strong>10 นาที</strong>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 20px 0 10px 0; color: #777777; font-size: 14px;">
                                หากปุ่มด้านบนไม่ทำงาน กรุณาคัดลอกลิงก์ด้านล่างและวางในเบราว์เซอร์:
                            </p>
                            
                            <p style="margin: 0; padding: 10px; background-color: #f5f5f5; border-radius: 4px; word-break: break-all; font-size: 12px; color: #3FA170;">
                                ${resetUrl}
                            </p>
                            
                            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
                            
                            <p style="margin: 0 0 20px 0; color: #999999; font-size: 13px;">
                                หากคุณไม่ได้เป็นผู้ร้องขอ โปรดเพิกเฉยต่ออีเมลฉบับนี้ รหัสผ่านของคุณจะยังคงปลอดภัย
                            </p>
                            
                            <p style="margin: 0; color: #555555; font-size: 14px;">
                                ขอบคุณครับ,<br/>
                                <strong>ทีมงาน IngreCare System</strong>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9f9f9; padding: 20px; text-align: center;">
                            <p style="margin: 0; color: #999999; font-size: 12px;">
                                © ${new Date().getFullYear()} IngreCare System. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

// Export เพิ่มเติมสำหรับใช้งานอื่นๆ
export const sendVerificationEmail = async (options) => {
    console.log('sendVerificationEmail not implemented yet');
};

export default {
    sendPasswordResetEmail,
    sendVerificationEmail,
};