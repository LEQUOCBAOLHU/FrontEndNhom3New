import React, { useEffect, useState } from 'react';
import { Table, Spin, message } from 'antd';
import { apiFetch } from '../auth';
import './LichSuTichDiemAdmin.css';

export default function LichSuTichDiemAdmin() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLichSu();
  }, []);

  const fetchLichSu = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('http://localhost:5189/api/TichDiem/lich-su?pageNumber=1&pageSize=100');
      const json = await res.json();
      let list = Array.isArray(json) ? json : (json.data?.lichSuTichDiems || json.lichSuTichDiems || json.LichSuTichDiems || []);
      setData(list);
    } catch (e) {
      setData([]);
      message.error('Không thể lấy lịch sử tích điểm!');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Khách hàng', dataIndex: 'tenKhachHang', key: 'tenKhachHang' },
    { title: 'Điểm tích lũy', dataIndex: 'diem', key: 'diem' },
    { title: 'Ngày tích điểm', dataIndex: 'ngayTichDiem', key: 'ngayTichDiem' },
    { title: 'Ghi chú', dataIndex: 'ghiChu', key: 'ghiChu' },
  ];

  return (
    <div className="lichsu-tichdiem-admin-container">
      <h2>Lịch sử tích điểm khách hàng</h2>
      <Spin spinning={loading}>
        <Table columns={columns} dataSource={data} rowKey="maTichDiem" pagination={false} />
      </Spin>
    </div>
  );
}
