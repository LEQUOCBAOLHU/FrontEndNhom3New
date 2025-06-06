import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../auth';

function AdminLoaiPhong() {
  const [loaiPhongs, setLoaiPhongs] = useState([]);
  useEffect(() => {
    apiFetch('https://qlks-0dvh.onrender.com/api/LoaiPhong')
      .then(res => res.json())
      .then(data => setLoaiPhongs(data));
  }, []);
  return (
    <div>
      <h2>Quản lý Loại Phòng (Admin)</h2>
      <ul>
        {loaiPhongs && loaiPhongs.length > 0 ? loaiPhongs.map(lp => (
          <li key={lp.maLoaiPhong}>{lp.tenLoaiPhong} ({lp.maLoaiPhong})</li>
        )) : <li>Không có dữ liệu loại phòng</li>}
      </ul>
    </div>
  );
}

export default AdminLoaiPhong;
