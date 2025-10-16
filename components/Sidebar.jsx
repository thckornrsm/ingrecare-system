"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from '@iconify/react';
import { usePathname, useRouter } from "next/navigation";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function NavItem({ href, label, iconString, active, isLogout = false }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
        "focus:outline-none focus-visible:ring-2 focus-visible:[#3FA170] focus-visible:ring-offset-2",
        "active:translate-y-[1px]",
        "max-lg:justify-center",
        "lg:shadow-sm",

        isLogout
          ? "bg-white text-black hover:bg-red-50 max-lg:bg-transparent"
          : active
          ? "bg-[#3FA170] text-white"
          : "bg-white text-black hover:bg-gray-100 max-lg:bg-transparent"
      )}
    >
      <Icon
        icon={iconString} width={16}
        className={cn(
          isLogout
            ? "text-[#E15050]"
            : active
            ? "text-white"
            : "text-[#3FA170]"
        )}
      />
      <span className="max-lg:hidden">{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/");
      
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        // ใช้ window.location.href เพื่อทำการ Hard Refresh
        // ซึ่งจะล้าง State และ Cache ทั้งหมดของหน้าเว็บ
        window.location.href = '/login'; 
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('An error occurred during logout:', error);
    }
  };

  const mainMenu = [
    { href: "/dashboard", label: "หน้าหลัก", iconString: "material-symbols-light:dashboard-outline" },
    { href: "/statistics", label: "สถิติการใช้งาน", iconString: "gridicons:stats-alt" },
  ];

  const manageMenu = [
    { href: "/stockin", label: "นำเข้าวัตถุดิบ", iconString: "icon-park-twotone:inbox-in" },
    { href: "/stockout", label: "เบิกจ่ายวัตถุดิบ", iconString: "icon-park-solid:inbox-out" },
  ];

  const listMenu = [
    { href: "/allingredient", label: "วัตถุดิบคงเหลือทั้งหมด", iconString: "icon-park-outline:data-all" },
    { href: "/allexpired", label: "วัตถุดิบหมดอายุ", iconString: "pajamas:time-out" },
    { href: "/allstockin", label: "ประวัติการนำเข้า", iconString: "lucide:folder-input" },
    { href: "/allstockout", label: "ประวัติการเบิกจ่าย", iconString: "lucide:folder-output" },
  ];

  const generalMenu = [
    { href: "/settings", label: "การตั้งค่า", iconString: "material-symbols:settings-outline" },
    { href: "/logout", label: "ออกจากระบบ", iconString: "material-symbols:logout", isLogout: true },
  ];

  const Separator = () => (
    <>
      <p className="text-sm text-gray-400 font-light mb-2 max-lg:hidden">
        &nbsp;
      </p>
      {/* --- */}
      <div className="h-px w-8 mx-auto my-2 bg-gray-200 lg:hidden"></div>
    </>
  );
  
  const SectionHeader = ({ label }) => (
    <>
      <p className="text-sm text-gray-400 font-light mb-2 max-lg:hidden">
        {label}
      </p>
      <div className="h-px w-8 mx-auto my-2 bg-gray-200 lg:hidden"></div>
    </>
  );

  return (
    <aside className="max-w-75 w-full h-screen bg-[#F8FAFB] flex flex-col border-none shadow-md sticky top-0 max-lg:w-13">
      <div className="p-4 max-lg:p-2">
        <div className="bg-white px-3 py-4 border-n shadow-sm flex flex-col rounded-lg">
          <div className="flex items-center gap-3 max-lg:justify-center">
            <Image src="/logo.svg" alt="IngreCare Logo" width={48} height={48} />
            <div className="max-lg:hidden">
              <h2 className="font-semibold text-xl">Suki Teeyai</h2>
              <p className="text-sm text-gray-400">example@gmail.com</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-grow p-4 space-y-4 overflow-y-auto max-lg:p-2 max-lg:space-y-2">
        <section>
          <SectionHeader label="หน้าหลัก" />
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
          <SectionHeader label="การจัดการข้อมูล" />
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
          <SectionHeader label="ตารางข้อมูล" />
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

        <section>
          <SectionHeader label="ทั่วไป" />
          <div className="space-y-2">
            {generalMenu.map((m) => (
              <NavItem
                key={m.href}
                href={m.href}
                label={m.label}
                iconString={m.iconString}
                isLogout={m.isLogout}
                active={isActive(m.href)}
              />
            ))}
          </div>
        </section>
        {/*
          <button
            onClick={handleLogout}
            className={cn(
              "text-sm mt-2 flex items-center gap-1 rounded-md px-2 py-1 transition",
              "text-[#E15050] hover:bg-red-50 active:translate-y-[1px]",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
            )}
            type="button"
          >
            <Icon icon="material-symbols-light:logout" width={16} /> 
            ออกจากระบบ
          </button>
          */}

      </nav>
    </aside>
  );
}