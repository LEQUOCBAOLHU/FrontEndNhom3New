import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../auth';

function AdminPhong() {
  const [phongs, setPhongs] = useState([]);
  useEffect(() => {
    apiFetch('http://localhost:5189/api/Phong')
      .then(res => res.json())
      .then(data => setPhongs(data));
  }, []);
  return (
    <div>
      <h2>Quản lý Phòng (Admin)</h2>
      <ul>
        {phongs && phongs.length > 0 ? phongs.map(phong => (
          <li key={phong.maPhong}>{phong.tenPhong} ({phong.maPhong})</li>
        )) : <li>Không có dữ liệu phòng</li>}
      </ul>
    </div>
  );
}

export default AdminPhong;
