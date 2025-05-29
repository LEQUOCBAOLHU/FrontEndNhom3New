import React, { useEffect, useState } from 'react';
import { getDichVus } from '../../services/api';

function AdminDichVu() {
  const [dichVus, setDichVus] = useState([]);
  useEffect(() => {
    getDichVus().then(data => setDichVus(data));
  }, []);
  return (
    <div>
      <h2>Quản lý Dịch Vụ (Admin)</h2>
      <ul>
        {dichVus && dichVus.length > 0 ? dichVus.map(dv => (
          <li key={dv.maDichVu}>{dv.tenDichVu} ({dv.maDichVu})</li>
        )) : <li>Không có dữ liệu dịch vụ</li>}
      </ul>
    </div>
  );
}

export default AdminDichVu;
