"use client";
import React from "react";
import Swal from "sweetalert2";

function SweetAlertDelete({ ingredient, onConfirm }) {
  const handleDelete = () => {
    const swalWithTailwindButtons = Swal.mixin({
      customClass: {
        confirmButton:
          "m-2 px-8 py-2 text-sm font-medium text-white bg-[#3FA170] rounded-md hover:bg-[#1E7957]",
        cancelButton:
          "m-2 px-8 py-2 text-sm font-medium text-red-600 bg-white border border-red-500 rounded-md hover:bg-red-50",
      },
      buttonsStyling: false,
    });

    swalWithTailwindButtons
      .fire({
        title: "ยืนยันการลบข้อมูล",
        text: `คุณต้องการลบ "${ingredient?.name ?? ""}" ใช่ไหม?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "ใช่, ลบเลย!",
        cancelButtonText: "ไม่, ยกเลิก",
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          // เรียก callback เพื่อลบจริง (ถ้าส่งมา)
          if (typeof onConfirm === "function") onConfirm(ingredient);

          swalWithTailwindButtons.fire({
            title: "ลบสำเร็จ!",
            text: `วัตถุดิบ "${ingredient?.name ?? ""}" ถูกลบแล้ว`,
            icon: "success",
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire({
            title: "ยกเลิก",
            text: "ข้อมูลวัตถุดิบของคุณปลอดภัยดี",
            icon: "error",
          });
        }
      });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="m-2 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
    >
      ลบ
    </button>
  );
}

export default SweetAlertDelete;