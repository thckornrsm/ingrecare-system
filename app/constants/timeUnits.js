// app/constants/timeUnits.js

export const TIME_UNITS = [
  { name: 'วัน' },
  { name: 'สัปดาห์' },
  { name: 'เดือน' },
  { name: 'ปี' }
];

// Helper function ถ้าต้องการแปลงหน่วยเป็นวัน
export const convertToDay = (value, unit) => {
  const conversions = {
    'วัน': 1,
    'สัปดาห์': 7,
    'เดือน': 30,
    'ปี': 365
  };
  return value * (conversions[unit] || 1);
};

// Helper function สำหรับ dropdown
export const getTimeUnitsForDropdown = () => TIME_UNITS;