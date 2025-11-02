import nodemailer from 'nodemailer';

// 1. สร้าง Transporter (ใช้ซ้ำได้)
// เราใช้ข้อมูลจาก .env ที่คุณยืนยันมา
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: true, // Gmail/465 ใช้ SSL
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
});

/**
 * @description ส่งอีเมลแจ้งเตือนแอดมินเมื่อมีร้านค้าใหม่
 * @param storeData ข้อมูลร้านค้าที่เพิ่งสร้างเสร็จ (จาก Prisma)
 */
export const sendStoreSubmissionEmail = async (storeData) => {
    const adminEmail = process.env.ADMIN_EMAIL;
    const fromEmail = process.env.EMAIL_FROM;

    if (!adminEmail) {
        console.error('ADMIN_EMAIL is not defined in .env');
        return; // ไม่ต้องทำอะไรต่อ
    }

    const mailOptions = {
        from: `IngreCare System <${fromEmail}>`,
        to: adminEmail, // ส่งไปที่แอดมิน
        subject: `[IngreCare] มีร้านค้าใหม่: ${storeData.name}`,
        html: `
            <div style="font-family: 'Sarabun', 'Kanit', Arial, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                <div style="background-color: #f9f9f9; padding: 20px;">
                    <h1 style="color: #333; margin: 0;">📬 มีข้อมูลร้านค้าใหม่</h1>
                </div>
                
                <div style="padding: 30px; line-height: 1.6;">
                    <p style="font-size: 16px;">สวัสดีแอดมิน,</p>
                    <p style="font-size: 16px;">มีร้านค้าใหม่ (${storeData.name}) ได้ทำการส่งข้อมูลเข้ามาในระบบ:</p>
                    
                    <div style="background-color: #fafafa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">รายละเอียด:</h3>
                        <ul style="font-size: 16px; list-style-type: none; padding-left: 0;">
                            <li><strong>ID ร้าน:</strong> ${storeData.store_id}</li>
                            <li><strong>ชื่อร้าน:</strong> ${storeData.name}</li>
                            <li><strong>อีเมลติดต่อ:</strong> ${storeData.email || 'ไม่ได้ระบุ'}</li>
                            <li><strong>เบอร์โทร:</strong> ${storeData.phone || 'ไม่ได้ระบุ'}</li>
                            <li><strong>ที่อยู่:</strong> ${storeData.address || ''}</li>
                            <li><strong>ตำบล:</strong> ${storeData.subdistrict_name_th || 'N/A'}</li>
                            <li><strong>อำเภอ:</strong> ${storeData.district_name_th || 'N/A'}</li>
                            <li><strong>จังหวัด:</strong> ${storeData.province_name_th || 'N/A'}</li>
                            <li><strong>รหัสไปรษณีย์:</strong> ${storeData.zipcode || 'N/A'}</li>
                        </ul>
                    </div>
                    
                    <p style="font-size: 16px;">กรุณาตรวจสอบข้อมูลในระบบด้วยครับ</p>
                </div>
            </div>
        `,
    };

    // ส่งอีเมล
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Admin notification email sent successfully:', info.messageId);
    } catch (error) {
        console.error('Error sending admin notification email:', error);
        // เราไม่ throw error ที่นี่ เพื่อไม่ให้ API หลักล่ม
    }
};
