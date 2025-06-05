import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../auth';

function UserLoaiPhong() {
  const [loaiPhongs, setLoaiPhongs] = useState([]);
  useEffect(() => {
    apiFetch('http://localhost:5189/api/LoaiPhong')
      .then(res => res.json())
      .then(data => setLoaiPhongs(data));
  }, []);
  return (
    <div>
      <h2>Quản lý Loại Phòng (User)</h2>
      <ul>
        {loaiPhongs && loaiPhongs.length > 0 ? loaiPhongs.map(lp => (
          <li key={lp.maLoaiPhong}>{lp.tenLoaiPhong} ({lp.maLoaiPhong})</li>
        )) : <li>Không có dữ liệu loại phòng</li>}
      </ul>
    </div>
  );
}

export default UserLoaiPhong;
