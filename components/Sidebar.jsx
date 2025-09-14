"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard,BarChart2,Inbox,Package,History,Wrench,LogOut } from "lucide-react";

// รวม class
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function NavItem({ href, label, Icon, active }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
        "focus:outline-none focus-visible:ring-2 focus-visible:[#3FA170] focus-visible:ring-offset-2",
        "active:translate-y-[1px]",
        !active && "text-black bg-white hover:bg-gray-100 shadow-sm",
        active && "text-white bg-[#3FA170] shadow-sm"
      )}
    >
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/");

  const mainMenu = [
    { href: "/dashboard", label: "หน้าหลัก", Icon: LayoutDashboard },
    { href: "/stat", label: "สถิติการใช้งาน", Icon: BarChart2 },
  ];

  const manageMenu = [
    { href: "/stockin", label: "นำเข้าวัตถุดิบ", Icon: Package },
    { href: "/stockout", label: "เบิกจ่ายวัตถุดิบ", Icon: Package },
  ];

  const listMenu = [
    { href: "/inventory", label: "วัตถุดิบคงเหลือทั้งหมด", Icon: Inbox },
    { href: "/expired", label: "วัตถุดิบหมดอายุ", Icon: Package },
    { href: "/history/in", label: "ประวัติการนำเข้า", Icon: History },
    { href: "/history/out", label: "ประวัติการเบิกจ่าย", Icon: Wrench },
  ];

  return (
    <aside className="w-72 bg-[#F8FAFB] flex flex-col border-none shadow-md h-full">
      <div className="p-4">
        <div className="bg-white p-4 px-3 py-2 border-n shadow-sm flex flex-col rounded-lg">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="IngreCare Logo" width={54} height={54} />
            <div>
              <h2 className="font-semibold text-xl">Suki Teeyai</h2>
              <p className="text-sm text-gray-500">ผู้จัดการร้าน</p>
          </div>
        </div>
        <button
          className={cn(
            "text-sm mt-2 flex items-center gap-1 rounded-md px-2 py-1 transition",
            "text-[#E15050] hover:bg-red-50 active:translate-y-[1px]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          )}
          type="button"
        >
          <LogOut size={14} />
          ออกจากระบบ
        </button>
        </div>
      </div>

      <nav className="flex-grow p-4 space-y-4">
        <section>
          <p className="text-s text-gray-400 uppercase font-light mb-2">
            เมนูหลัก
          </p>
          <div className="space-y-2">
            {mainMenu.map((m) => (
              <NavItem
                key={m.href}
                href={m.href}
                label={m.label}
                Icon={m.Icon}
                active={isActive(m.href)}
              />
            ))}
          </div>
        </section>

        <section>
          <p className="text-s text-gray-400 uppercase font-light mb-2">
            การจัดการข้อมูล
          </p>
          <div className="space-y-2">
            {manageMenu.map((m) => (
              <NavItem
                key={m.href}
                href={m.href}
                label={m.label}
                Icon={m.Icon}
                active={isActive(m.href)}
              />
            ))}
          </div>
        </section>

        <section>
          <p className="text-s text-gray-400 uppercase font-light mb-2">
            รายการข้อมูล
          </p>
          <div className="space-y-2">
            {listMenu.map((m) => (
              <NavItem
                key={m.href}
                href={m.href}
                label={m.label}
                Icon={m.Icon}
                active={isActive(m.href)}
              />
            ))}
          </div>
        </section>
      </nav>
    </aside>
  );
}
