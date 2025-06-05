import React, { useEffect, useState } from 'react';
import { Table, Spin, message } from 'antd';
import { apiFetch } from '../auth';
import './KhuyenMaiUser.css';

export default function KhuyenMaiUser() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKhuyenMai();
  }, []);

  const fetchKhuyenMai = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('http://localhost:5189/api/KhuyenMai?pageNumber=1&pageSize=100');
      const json = await res.json();
      let list = Array.isArray(json) ? json : (json.data?.khuyenMais || json.khuyenMais || json.KhuyenMais || []);
      setData(list);
    } catch (e) {
      setData([]);
      message.error('Không thể lấy dữ liệu khuyến mãi!');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Tên khuyến mãi', dataIndex: 'tenKhuyenMai', key: 'tenKhuyenMai' },
    { title: 'Mô tả', dataIndex: 'moTa', key: 'moTa' },
    { title: 'Giá trị (%)', dataIndex: 'giaTri', key: 'giaTri', render: v => v + '%' },
    { title: 'Ngày bắt đầu', dataIndex: 'ngayBatDau', key: 'ngayBatDau' },
    { title: 'Ngày kết thúc', dataIndex: 'ngayKetThuc', key: 'ngayKetThuc' },
  ];

  return (
    <div className="khuyenmai-user-container">
      <h2>Danh sách khuyến mãi</h2>
      <Spin spinning={loading}>
        <Table columns={columns} dataSource={data} rowKey="maKhuyenMai" pagination={false} />
      </Spin>
    </div>
  );
}
