"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from '@iconify/react';
import { usePathname } from "next/navigation";

// รวม class
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Rename the prop for clarity from Icon to iconString
function NavItem({ href, label, iconString, active }) {
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
      <Icon
        icon={iconString}
        width={16}
        className={cn(
          !active && "text-[#3FA170]", active && "text-white"
        )}
      />
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
    { href: "/dashboard", label: "หน้าหลัก", iconString: "material-symbols-light:dashboard-outline" },
    { href: "/statistics", label: "สถิติการใช้งาน", iconString: "gridicons:stats-alt" },
  ];

  const manageMenu = [
    { href: "/stockin", label: "นำเข้าวัตถุดิบ", iconString: "icon-park-twotone:inbox-in" },
    { href: "/stockout", label: "เบิกจ่ายวัตถุดิบ", iconString: "icon-park-solid:inbox-out" },
  ];

  const listMenu = [
    { href: "/allingredient", label: "วัตถุดิบทั้งหมด", iconString: "icon-park-outline:data-all" },
    { href: "/allexpired", label: "วัตถุดิบหมดอายุ", iconString: "pajamas:time-out" },
    { href: "/allstockin", label: "ประวัติการนำเข้า", iconString: "lucide:folder-input" },
    { href: "/allstockout", label: "ประวัติการเบิกจ่าย", iconString: "lucide:folder-output" },
  ];

  return (
    <aside className="max-w-[300px] w-full h-full bg-[#F8FAFB] flex flex-col border-none shadow-md max-50:w-[52px]">
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
            ออกจากระบบ
          </button>
        </div>
      </div>

      <nav className="flex-grow p-4 space-y-4">
        <section>
          <p className="text-s text-gray-400 font-light mb-2">
            Dashboard
          </p>
          <div className="space-y-2">
            {mainMenu.map((m) => (
              <NavItem
                key={m.href}
                href={m.href}
                label={m.label}
                iconString={m.iconString}
                active={isActive(m.href)}
              />
            ))}
          </div>
        </section>

        <section>
          <p className="text-s text-gray-400 font-light mb-2">
            การจัดการข้อมูล
          </p>
          <div className="space-y-2">
            {manageMenu.map((m) => (
              <NavItem
                key={m.href}
                href={m.href}
                label={m.label}
                iconString={m.iconString}
                active={isActive(m.href)}
              />
            ))}
          </div>
        </section>

        <section>
          <p className="text-s text-gray-400 font-light mb-2">
            รายการข้อมูล
          </p>
          <div className="space-y-2">
            {listMenu.map((m) => (
              <NavItem
                key={m.href}
                href={m.href}
                label={m.label}
                iconString={m.iconString}
                active={isActive(m.href)}
              />
            ))}
          </div>
        </section>
      </nav>
    </aside>
  );
}