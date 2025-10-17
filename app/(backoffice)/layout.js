import Sidebar from "@/components/Sidebar";
import { cookies } from "next/headers";
import { verifySession } from "@/utils/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function BackofficeLayout({ children }) {
  const token = cookies().get("token")?.value;
  // ✨ เพิ่ม Log เพื่อดูว่าหา Token เจอมั้ย
  console.log("Layout: Found Token:", token ? "Yes" : "No");

  const session = await verifySession(token);
  // ✨ เพิ่ม Log เพื่อดูว่าถอดรหัส Session ได้อะไร
  console.log("Layout: Decoded Session:", session); 

  if (!session || !session.sid) {
    // ✨ เพิ่ม Log เพื่อดูว่าทำไมถึง Redirect
    console.log("Layout: Session is invalid or missing sid. Redirecting to /login");
    redirect("/login");
  }

  const storeData = await prisma.store.findUnique({
    where: { store_id: session.sid },
    select: { name: true },
  });

  const userData = await prisma.user.findUnique({
    where: { user_id: session.uid },
    select: { email: true },
  });

  const storeName = storeData?.name || "ไม่พบชื่อร้าน";
  const userEmail = userData?.email || "example@email.com";

  return (
    <div className="flex h-screen bg-white">
      <Sidebar storeName={storeName} userEmail={userEmail} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}