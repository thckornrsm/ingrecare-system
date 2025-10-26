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

    // 2. กำหนดรายละเอียดอีเมล
    const mailOptions = {
        from: `IngreCare <${process.env.EMAIL_FROM}>`,
        to: options.to,
        subject: 'คำขอเปลี่ยนรหัสผ่านสำหรับ IngreCare System',
        html: `
            <div style="font-family: Kanit; line-height: 1.6;">
                <h2>สวัสดีคุณ ${options.name},</h2>
                <p>เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</p>
                <p>กรุณาคลิกที่ปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่ ลิงก์นี้จะหมดอายุใน 10 นาที:</p>
                <a href="${options.url}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    ตั้งรหัสผ่านใหม่
                </a>
                <p>หากคุณไม่ได้เป็นผู้ร้องขอ โปรดเพิกเฉยต่ออีเมลฉบับนี้</p>
                <p>ขอบคุณครับ,<br/>ทีมงาน IngreCare System</p>
            </div>
        `,
    };

    // 3. ส่งอีเมล
    await transporter.sendMail(mailOptions);
};