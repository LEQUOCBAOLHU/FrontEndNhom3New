import React, { useEffect, useState } from 'react';
import { getDatPhongs } from '../../services/api';

function AdminDatPhong() {
  const [datPhongs, setDatPhongs] = useState([]);
  useEffect(() => {
    getDatPhongs().then(data => setDatPhongs(data));
  }, []);
  return (
    <div>
      <h2>Quản lý Đặt Phòng (Admin)</h2>
      <ul>
        {datPhongs && datPhongs.length > 0 ? datPhongs.map(dp => (
          <li key={dp.maDatPhong}>{dp.maDatPhong} - {dp.maPhong} - {dp.trangThai}</li>
        )) : <li>Không có dữ liệu đặt phòng</li>}
      </ul>
    </div>
  );
}

export default AdminDatPhong;
