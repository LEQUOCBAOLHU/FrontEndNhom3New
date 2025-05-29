import React, { useEffect, useState } from 'react';
import { getKhachHangs } from '../../services/api';

function UserKhachHang() {
  const [khachHangs, setKhachHangs] = useState([]);
  useEffect(() => {
    getKhachHangs().then(data => setKhachHangs(data));
  }, []);
  return (
    <div>
      <h2>Quản lý Khách Hàng (User)</h2>
      <ul>
        {khachHangs && khachHangs.length > 0 ? khachHangs.map(kh => (
          <li key={kh.maKh}>{kh.hoTen} ({kh.maKh})</li>
        )) : <li>Không có dữ liệu khách hàng</li>}
      </ul>
    </div>
  );
}

export default UserKhachHang;
