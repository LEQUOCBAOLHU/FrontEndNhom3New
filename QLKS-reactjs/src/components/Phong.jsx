import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select,
  Typography, Card, Row, Col, Statistic, Space, Tag, message
} from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { 
  UserOutlined, KeyOutlined, CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import './Phong.css';
import { apiFetch } from '../auth';

const { Title } = Typography;
const { Option } = Select;
const COLORS = ['#00C49F', '#FF8042', '#FFBB28'];

function Phong() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [phongs, setPhongs] = useState([]);
  const [selectedPhong, setSelectedPhong] = useState(null);
  const [roomStats, setRoomStats] = useState({
    available: 0,
    occupied: 0,
    maintenance: 0
  });
  const [form] = Form.useForm();

  const fetchRooms = async () => {
    try {
      const response = await apiFetch('http://localhost:5189/api/Phong?pageNumber=1&pageSize=10');
      if (response.ok) {
        const data = await response.json();
        // Lấy đúng mảng phòng từ backend (dạng phân trang)
        const list = Array.isArray(data)
          ? data
          : (data.data?.phongs || data.phongs || data.Phongs || []);
        const mapped = list.map(room => ({
          ...room,
          trangThai: room.trangThai || room.tinhTrang || '',
          tenPhong: room.tenPhong || room.TenPhong || '',
          maPhong: room.maPhong || room.MaPhong || '',
          tenLoaiPhong: room.tenLoaiPhong || room.TenLoaiPhong || ''
        }));
        setPhongs(mapped);
        // Tính toán thống kê phòng
        const stats = {
          available: mapped.filter(room => room.trangThai === 'Trống').length,
          occupied: mapped.filter(room => room.trangThai === 'Đang sử dụng').length,
          maintenance: mapped.filter(room => room.trangThai === 'Bảo trì').length
        };
        setRoomStats(stats);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const pieChartData = [
    { name: 'Phòng trống', value: roomStats.available },
    { name: 'Phòng đã đặt', value: roomStats.occupied },
    { name: 'Đang bảo trì', value: roomStats.maintenance }
  ];

  const columns = [
    {
      title: 'Mã phòng',
      dataIndex: 'maPhong',
      key: 'maPhong',
      sorter: (a, b) => a.maPhong.localeCompare(b.maPhong),
    },
    {
      title: 'Tên phòng',
      dataIndex: 'tenPhong',
      key: 'tenPhong',
      sorter: (a, b) => a.tenPhong.localeCompare(b.tenPhong),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      filters: [
        { text: 'Đang sử dụng', value: 'Đang sử dụng' },
        { text: 'Đã đặt', value: 'Đã đặt' },
        { text: 'Bảo trì', value: 'Bảo trì' },
        { text: 'Trống', value: 'Trống' },
      ],
      onFilter: (value, record) => record.trangThai.includes(value),
      render: (text) => {
        let color = 'default';
        if (text === 'Đang sử dụng') color = 'red';
        else if (text === 'Đã đặt') color = 'blue';
        else if (text === 'bảo trì') color = 'gold';
        else if (text === 'Trống') color = 'green';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Loại phòng',
      dataIndex: 'tenLoaiPhong',
      key: 'tenLoaiPhong',
      sorter: (a, b) => a.tenLoaiPhong.localeCompare(b.tenLoaiPhong),
    }
  ];

  const handleUpdateStatus = async (values) => {
    if (!selectedPhong) return;
    await apiFetch(`http://localhost:5189/api/Phong/${selectedPhong.maPhong}/trang-thai`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trangThai: values.trangThai })
    });
    message.success('Cập nhật trạng thái phòng thành công!');
    setIsStatusModalVisible(false);
    fetchRooms();
  };

  const handleAddRoom = async (values) => {
    try {
      const response = await apiFetch('http://localhost:5189/api/Phong', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        message.success('Thêm phòng mới thành công!');
        setIsModalVisible(false);
        form.resetFields();
        fetchRooms();
      } else {
        message.error('Thêm phòng mới thất bại!');
      }
    } catch (error) {
      console.error('Error adding room:', error);
      message.error('Đã xảy ra lỗi khi thêm phòng mới!');
    }
  };

  return (
    <div className="phong-container">
      <Title level={2} className="page-title">Quản lý Phòng</Title>

      {/* Dashboard Section */}
      <Row gutter={[16, 16]} className="stats-section">
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Tổng số phòng"
              value={roomStats.total}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Phòng trống"
              value={roomStats.available}
              prefix={<KeyOutlined />}
              valueStyle={{ color: '#00C49F' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Phòng đã đặt"
              value={roomStats.occupied}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#FF8042' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Đang bảo trì"
              value={roomStats.maintenance}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#FFBB28' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Chart Section */}
      <Row gutter={[16, 16]} className="chart-section">
        <Col xs={24} md={12}>
          <Card className="chart-card">
            <Title level={4}>Trạng thái phòng</Title>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card className="chart-card">
            <Space className="action-buttons">
              <Button type="primary" onClick={() => setIsModalVisible(true)}>
                Thêm phòng mới
              </Button>
              <Button onClick={fetchRooms}>Làm mới dữ liệu</Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Room Table */}
      <Card className="table-card">
        <Table
          columns={columns}
          dataSource={phongs}
          rowKey="maPhong"
          pagination={{
            pageSize: 10,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} phòng`
          }}
        />
      </Card>

      {/* Modals */}
      <Modal
        title="Cập nhật trạng thái phòng"
        open={isStatusModalVisible}
        onCancel={() => setIsStatusModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" onFinish={handleUpdateStatus}>
          <Form.Item label="Trạng thái" name="trangThai" rules={[{ required: true, message: 'Chọn trạng thái!' }]}> 
            <Select>
              <Option value="Trống">Trống</Option>
              <Option value="Đang sử dụng">Đang sử dụng</Option>
              <Option value="Bảo trì">Bảo trì</Option>
            </Select>
          </Form.Item>
          <Form.Item> <Button type="primary" htmlType="submit">Cập nhật</Button> </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Thêm phòng mới"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddRoom}
        >
          <Form.Item
            name="maPhong"
            label="Mã phòng"
            rules={[{ required: true, message: 'Vui lòng nhập mã phòng!' }]}
          >
            <Input placeholder="Nhập mã phòng" />
          </Form.Item>
          <Form.Item
            name="tenPhong"
            label="Tên phòng"
            rules={[{ required: true, message: 'Vui lòng nhập tên phòng!' }]}
          >
            <Input placeholder="Nhập tên phòng" />
          </Form.Item>
          <Form.Item
            name="tenLoaiPhong"
            label="Loại phòng"
            rules={[{ required: true, message: 'Vui lòng chọn loại phòng!' }]}
          >
            <Select placeholder="Chọn loại phòng">
              <Option value="Loại 1">Loại 1</Option>
              <Option value="Loại 2">Loại 2</Option>
              <Option value="Loại 3">Loại 3</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="trangThai"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="Trống">Trống</Option>
              <Option value="Đang sử dụng">Đang sử dụng</Option>
              <Option value="Bảo trì">Bảo trì</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Thêm phòng
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Phong;
