import React, { useEffect, useState } from 'react';
import { getHoaDons } from '../../services/api';

function UserHoaDon() {
  const [hoaDons, setHoaDons] = useState([]);
  useEffect(() => {
    getHoaDons().then(data => setHoaDons(data));
  }, []);
  return (
    <div>
      <h2>Hóa Đơn (User)</h2>
      <ul>
        {hoaDons && hoaDons.length > 0 ? hoaDons.map(hd => (
          <li key={hd.maHoaDon}>{hd.maHoaDon} - {hd.trangThai}</li>
        )) : <li>Không có dữ liệu hóa đơn</li>}
      </ul>
    </div>
  );
}

export default UserHoaDon;
