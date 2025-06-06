import React, { useEffect, useState } from 'react';
import { getAccounts } from '../../services/api';

function AdminTaiKhoanKhachHang() {
  const [accounts, setAccounts] = useState([]);
  useEffect(() => {
    getAccounts().then(data => setAccounts(data));
  }, []);
  return (
    <div>
      <h2>Quản lý Tài Khoản Khách Hàng (Admin)</h2>
      <ul>
        {accounts && accounts.length > 0 ? accounts.map(acc => (
          <li key={acc.email}>{acc.hoTen} ({acc.email})</li>
        )) : <li>Không có dữ liệu tài khoản</li>}
      </ul>
    </div>
  );
}

export default AdminTaiKhoanKhachHang;
