import React, { useEffect, useState } from 'react';
import { Table, Spin, message } from 'antd';
import { apiFetch } from '../auth';
import './TichDiemAdmin.css';

export default function TichDiemAdmin() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTichDiem();
  }, []);

  const fetchTichDiem = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('http://localhost:5189/api/TichDiem?pageNumber=1&pageSize=100');
      const json = await res.json();
      let list = Array.isArray(json) ? json : (json.data?.lichSuTichDiems || json.lichSuTichDiems || json.LichSuTichDiems || []);
      setData(list);
    } catch (e) {
      setData([]);
      message.error('Không thể lấy dữ liệu tích điểm!');
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
    <div className="tichdiem-admin-container">
      <h2>Quản lý chương trình tích điểm (Admin)</h2>
      <Spin spinning={loading}>
        <Table columns={columns} dataSource={data} rowKey="maTichDiem" pagination={false} />
      </Spin>
    </div>
  );
}
