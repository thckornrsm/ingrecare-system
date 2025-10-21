// utils/safeFetchJSON.js

export async function safeFetchJSON(url, init, options) { // เพิ่ม options
  const res = await fetch(url, {
    headers: { Accept: 'application/json', ...(init?.headers || {}) },
    ...init,
  });

  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();

  if (!contentType.includes('application/json')) {
    // เพิ่มการตรวจสอบ okIf401 แม้ว่าจะไม่ใช่ JSON (เช่น 401 มักจะไม่มี body เป็น json)
    if (options?.okIf401 && res.status === 401) {
      return null;
    }
    const snippet = text.slice(0, 200);
    throw new Error(`Expected JSON. HTTP ${res.status}. Snippet: ${snippet}`);
  }

  const data = text ? JSON.parse(text) : null;
  
  if (!res.ok) {
    // --- นี่คือจุดที่แก้ไข ---
    // ถ้า res.ok เป็น false (เช่น 401)
    // ให้ตรวจสอบว่ามี options.okIf401 และ status เป็น 401 หรือไม่
    if (options?.okIf401 && res.status === 401) {
      return data; // ถ้าใช่, ไม่ต้องโยน Error แต่ให้ return data (เช่น { user: null }) กลับไป
    }
    // ถ้าไม่ใช่ (เช่น 500, 404 หรือ 401 ที่ไม่ได้ตั้งใจให้ ok) ให้โยน Error ตามเดิม
    throw new Error(data?.error || `${res.status} ${res.statusText}`);
  }
  
  return data;
}