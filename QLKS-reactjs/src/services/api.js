export async function getPhongs() {
  const res = await fetch('http://localhost:5189/api/Phong');
  return res.json();
}

export async function getLoaiPhongs() {
  const res = await fetch('http://localhost:5189/api/LoaiPhong');
  return res.json();
}

export async function getDichVus() {
  const res = await fetch('http://localhost:5189/api/DichVu');
  return res.json();
}

export async function getKhachHangs() {
  const res = await fetch('http://localhost:5189/api/KhachHang');
  return res.json();
}

export async function getAccounts() {
  const res = await fetch('http://localhost:5189/api/Account');
  return res.json();
}

export async function getDatPhongs() {
  const res = await fetch('http://localhost:5189/api/DatPhong');
  return res.json();
}

export async function getHoaDons() {
  const res = await fetch('http://localhost:5189/api/HoaDon');
  return res.json();
}