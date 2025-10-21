// app/(backoffice)/layout.jsx (แก้ไข)

import Sidebar from "@/components/Sidebar";
import { cookies } from "next/headers";
import { verifySession } from "@/utils/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SessionProvider } from './session-provider'; // 👈 1. Import Provider

// ฟังก์ชันดึงข้อมูล (เปลี่ยนจาก 2 query เป็น 1 query)
async function getUserData(session) {
  if (!session || !session.uid) {
    return null;
  }
  
  try {
    // 👈 2. ดึง User พร้อม Store (เหมือนใน me/route.js)
    const user = await prisma.user.findUnique({
      where: { user_id: Number(session.uid) },
      select: {
        user_id: true,
        email: true,
        name: true,
        role: true,
        store_id: true,
        store: { // 👈 ดึง store มาพร้อมกันเลย
          select: {
            store_id: true,
            name: true,
            address: true,
            province_name_th: true,
            district_name_th: true,
            subdistrict_name_th: true,
            zipcode: true,
          },
        },
      },
    });
    return user;
  } catch (e) {
    console.error("Layout getUserData Error:", e.message);
    return null;
  }
}

export default async function BackofficeLayout({ children }) {
  const token = cookies().get("token")?.value;
  const session = await verifySession(token);

  if (!session || !session.uid) { // 👈 (เปลี่ยนมาเช็ค uid ดีกว่าครับ)
    console.log("Layout: Session invalid or missing uid. Redirecting.");
    redirect("/login");
  }
  
  // 👈 3. เรียกใช้ฟังก์ชันดึงข้อมูล
  const user = await getUserData(session);

  if (!user) {
    console.log("Layout: User not found in DB. Redirecting.");
    redirect("/login");
  }

  // (ข้อมูลสำหรับ Sidebar ยังเหมือนเดิม)
  const storeName = user.store?.name || "ไม่พบชื่อร้าน";
  const userEmail = user.email || "ไม่พบอีเมล";

  return (
    // 👈 4. หุ้มด้วย SessionProvider
    <SessionProvider user={user}>
      <div className="flex h-screen bg-white">
        <Sidebar storeName={storeName} userEmail={userEmail} />
        <div className="flex-1 flex flex-col overflow-hidden">
          {children} {/* 👈 (SettingsPage จะอยู่ตรงนี้) */}
        </div>
      </div>
    </SessionProvider>
  );
}