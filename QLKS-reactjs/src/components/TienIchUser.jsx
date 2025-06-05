import React, { useEffect, useState } from 'react';
import { Table, Spin, message } from 'antd';
import { apiFetch } from '../auth';
import './TienIchUser.css';

export default function TienIchUser() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTienIch();
  }, []);

  const fetchTienIch = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('http://localhost:5189/api/DichVu?pageNumber=1&pageSize=100');
      const json = await res.json();
      let list = Array.isArray(json) ? json : (json.data?.dichVus || json.dichVus || json.DichVus || []);
      setData(list);
    } catch (e) {
      setData([]);
      message.error('Không thể lấy dữ liệu tiện ích!');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Tên tiện ích', dataIndex: 'tenDichVu', key: 'tenDichVu' },
    { title: 'Mô tả', dataIndex: 'moTa', key: 'moTa' },
    { title: 'Giá', dataIndex: 'gia', key: 'gia', render: v => v ? v.toLocaleString() + ' VNĐ' : '' },
  ];

  return (
    <div className="tienich-user-container">
      <h2>Danh sách tiện ích khách sạn</h2>
      <Spin spinning={loading}>
        <Table columns={columns} dataSource={data} rowKey="maDichVu" pagination={false} />
      </Spin>
    </div>
  );
}
