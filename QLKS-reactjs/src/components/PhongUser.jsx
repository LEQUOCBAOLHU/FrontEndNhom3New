import React, { useEffect, useState } from 'react';
import { Table, Spin, Card } from 'antd';
import { apiFetch } from '../auth';
import './PhongUser.css';

export default function PhongUser() {
  const [phongs, setPhongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhongs();
  }, []);

  const fetchPhongs = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('http://localhost:5189/api/Phong?pageNumber=1&pageSize=100');
      const data = await res.json();
      let list = [];
      if (data && data.data && Array.isArray(data.data.phongs)) {
        list = data.data.phongs;
      } else if (data && Array.isArray(data.phongs)) {
        list = data.phongs;
      } else if (data && Array.isArray(data.Phongs)) {
        list = data.Phongs;
      } else if (Array.isArray(data)) {
        list = data;
      }
      setPhongs(list);
    } catch {
      setPhongs([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Tên phòng', dataIndex: 'tenPhong', key: 'tenPhong' },
    { title: 'Loại phòng', dataIndex: 'maLoaiPhong', key: 'maLoaiPhong' },
    { title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai' },
    { title: 'Giá', dataIndex: 'gia', key: 'gia', render: v => v ? v.toLocaleString() + ' VNĐ' : '' },
    { title: 'Mô tả', dataIndex: 'moTa', key: 'moTa' },
  ];

  return (
    <div className="phong-user-container">
      <h2>Danh sách phòng</h2>
      <Spin spinning={loading}>
        <Card bordered={false} className="phong-user-card">
          <Table
            columns={columns}
            dataSource={phongs}
            rowKey="maPhong"
            pagination={{ pageSize: 8 }}
          />
        </Card>
      </Spin>
    </div>
  );
}
