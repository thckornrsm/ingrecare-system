import { Kanit } from "next/font/google"
import "./globals.css";


const kanit = Kanit({
  variable: "--font-kanit",
  weight: ["400", "700"],
  subsets: ["latin"],
})

export const metadata = {
  title: "IngreCare System",
  description: "ระบบจัดการวัตถุดิบหลังร้านสำหรับร้านอาหาร",
  icons: { icon: "../logo.svg", },
}

export default function RootLayout({
  children 
}) {
  return (
    <html lang="en">
      <body className={`${kanit.variable} antialiased`}>
        <div className="min-h-screen bg-white text-[#0F2B46]">
          {children}
        </div>
      </body>
    </html>
  )
}