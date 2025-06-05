import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Space, Tag, Statistic, Row, Col } from 'antd';
import { apiFetch } from '../auth';

function QuanLyPhong() {
  const [phongs, setPhongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const fetchAllRooms = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('http://localhost:5189/api/Phong/get-all');
      const data = await res.json();
      setPhongs(Array.isArray(data) ? data : []);
    } catch (e) {
      setPhongs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await apiFetch('http://localhost:5189/api/Phong/thong-ke-trang-thai');
      const data = await res.json();
      setStats(data);
    } catch {
      setStats(null);
    }
  };

  useEffect(() => { fetchAllRooms(); fetchStats(); }, []);

  // Hiển thị thông báo nếu không có dữ liệu
  const hasData = Array.isArray(phongs) && phongs.length > 0;

  const columns = [
    { title: 'Mã phòng', dataIndex: 'maPhong', key: 'maPhong' },
    { title: 'Tên phòng', dataIndex: 'tenPhong', key: 'tenPhong' },
    { title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai', render: (text) => (
      <Tag color={text === 'Đang sử dụng' ? 'orange' : text === 'Đã đặt' ? 'blue' : text === 'Bảo trì' ? 'red' : 'green'}>{text}</Tag>
    ) },
    { title: 'Loại phòng', dataIndex: 'tenLoaiPhong', key: 'tenLoaiPhong' },
  ];

  return (
    <div style={{padding: 24}}>
      <h2>Quản lý phòng</h2>
      {stats && (
        <Row gutter={16} style={{marginBottom: 24}}>
          <Col><Card><Statistic title="Tổng số phòng" value={stats.tongSoPhong} /></Card></Col>
          <Col><Card><Statistic title="Phòng trống" value={stats.phongTrong} /></Card></Col>
          <Col><Card><Statistic title="Đang sử dụng" value={stats.dangSuDung} /></Card></Col>
          <Col><Card><Statistic title="Đang dọn" value={stats.dangDon} /></Card></Col>
          <Col><Card><Statistic title="Bảo trì" value={stats.baoTri} /></Card></Col>
        </Row>
      )}
      <Card title="Quản lý tất cả phòng (Chỉ dành cho Quản lý)" style={{margin:24}}>
        <Space style={{marginBottom:16}}>
          <Button onClick={fetchAllRooms}>Làm mới</Button>
        </Space>
        <Table columns={columns} dataSource={phongs} rowKey="maPhong" loading={loading} locale={{emptyText: hasData ? undefined : 'Không có dữ liệu phòng!'}} />
      </Card>
    </div>
  );
}

export default QuanLyPhong;
