import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select,
  Typography, Card, Row, Col, Statistic, Space, Tag, message, Popconfirm
} from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { 
  UserOutlined, KeyOutlined, CheckCircleOutlined,
  CloseCircleOutlined, EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined, EyeOutlined
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
    total: 0,
    available: 0,
    occupied: 0,
    maintenance: 0
  });
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loaiPhongs, setLoaiPhongs] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filterTrangThai, setFilterTrangThai] = useState('');

  const getTrangThaiColor = (trangThai) => {
    switch (trangThai) {
      case 'Trống':
        return 'green';
      case 'Đang sử dụng':
        return 'blue';
      case 'Bảo trì':
        return 'red';
      default:
        return 'default';
    }
  };

  const fetchRooms = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const response = await apiFetch(`http://localhost:5189/api/Phong?pageNumber=${page}&pageSize=${pageSize}`);
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
          total: mapped.length,
          available: mapped.filter(room => room.trangThai === 'Trống').length,
          occupied: mapped.filter(room => room.trangThai === 'Đang sử dụng').length,
          maintenance: mapped.filter(room => room.trangThai === 'Bảo trì').length
        };
        setRoomStats(stats);
        setPagination({
          current: data.data?.currentPage || 1,
          pageSize: data.data?.pageSize || 10,
          total: data.data?.totalItems || 0
        });
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoaiPhongs = async () => {
    try {
      const res = await apiFetch('http://localhost:5189/api/LoaiPhong?pageNumber=1&pageSize=100');
      const data = await res.json();
      if (data.data) {
        setLoaiPhongs(data.data.loaiPhongs);
      }
    } catch (error) {
      console.error('Error fetching loai phongs:', error);
    }
  };

  const fetchRoomsByTrangThai = async (trangThai) => {
    try {
      setLoading(true);
      const response = await apiFetch(`http://localhost:5189/api/Phong/trang-thai/${trangThai}?pageNumber=1&pageSize=100`);
      if (response.ok) {
        const data = await response.json();
        const list = data.data?.phongs || [];
        const mapped = list.map(room => ({
          ...room,
          trangThai: room.trangThai || room.tinhTrang || '',
          tenPhong: room.tenPhong || room.TenPhong || '',
          maPhong: room.maPhong || room.MaPhong || '',
          tenLoaiPhong: room.tenLoaiPhong || room.TenLoaiPhong || ''
        }));
        setPhongs(mapped);
      }
    } catch (error) {
      message.error('Lỗi khi lọc phòng theo trạng thái!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchLoaiPhongs();
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
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Chi tiết
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa phòng này?"
            onConfirm={() => handleDelete(record.maPhong)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
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

  const showModal = (record = null) => {
    if (record) {
      form.setFieldsValue({
        tenPhong: record.tenPhong,
        maLoaiPhong: record.maLoaiPhong,
        trangThai: record.trangThai,
        ghiChu: record.ghiChu
      });
      setEditingId(record.maPhong);
    } else {
      form.resetFields();
      setEditingId(null);
    }
    setIsModalVisible(true);
  };

  const handleViewDetails = async (record) => {
    try {
      const response = await apiFetch(`http://localhost:5189/api/Phong/${record.maPhong}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedPhong(data);
      }
    } catch (error) {
      message.error('Lỗi khi tải thông tin chi tiết');
      console.error('Error fetching details:', error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingId(null);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        await apiFetch(`http://localhost:5189/api/Phong/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });
        message.success('Cập nhật phòng thành công');
      } else {
        await apiFetch('http://localhost:5189/api/Phong', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });
        message.success('Thêm phòng mới thành công');
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchRooms();
    } catch (error) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Có lỗi xảy ra');
      }
      console.error('Error submitting form:', error);
    }
  };

  const handleDelete = async (maPhong) => {
    try {
      await apiFetch(`http://localhost:5189/api/Phong/${maPhong}`, {
        method: 'DELETE'
      });
      message.success('Xóa phòng thành công');
      fetchRooms();
    } catch (error) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Có lỗi xảy ra khi xóa phòng');
      }
      console.error('Error deleting phong:', error);
    }
  };

  const handleTableChange = (pagination) => {
    fetchRooms(pagination.current, pagination.pageSize);
  };

  return (
    <div className="phong-container">
      <Title level={2} className="page-title">Quản lý Phòng</Title>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Select
          style={{ width: 200 }}
          placeholder="Lọc theo trạng thái"
          allowClear
          value={filterTrangThai || undefined}
          onChange={value => {
            setFilterTrangThai(value);
            if (value) fetchRoomsByTrangThai(value);
            else fetchRooms();
          }}
        >
          <Option value="Trống">Trống</Option>
          <Option value="Đang sử dụng">Đang sử dụng</Option>
          <Option value="Bảo trì">Bảo trì</Option>
        </Select>
      </div>

      {/* Dashboard Section */}
      <Row gutter={[16, 16]} className="stats-section">
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Tổng số phòng"
              value={roomStats.total || 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Phòng trống"
              value={roomStats.available || 0}
              prefix={<KeyOutlined />}
              valueStyle={{ color: '#00C49F' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Phòng đã đặt"
              value={roomStats.occupied || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#FF8042' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Đang bảo trì"
              value={roomStats.maintenance || 0}
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
              <Button type="primary" onClick={() => showModal()}>
                Thêm phòng mới
              </Button>
              <Button onClick={() => fetchRooms()}>Làm mới dữ liệu</Button>
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
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
        />
      </Card>

      {/* Modals */}
      <Modal
        title="Cập nhật trạng thái phòng"
        open={isStatusModalVisible}
        onCancel={() => setIsStatusModalVisible(false)}
        destroyOnHidden
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
        onCancel={handleCancel}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="tenPhong"
            label="Tên phòng"
            rules={[{ required: true, message: 'Vui lòng nhập tên phòng!' }]}
          >
            <Input placeholder="Nhập tên phòng" />
          </Form.Item>
          <Form.Item
            name="maLoaiPhong"
            label="Loại phòng"
            rules={[{ required: true, message: 'Vui lòng chọn loại phòng!' }]}
          >
            <Select placeholder="Chọn loại phòng">
              {loaiPhongs.map(lp => (
                <Option key={lp.maLoaiPhong} value={lp.maLoaiPhong}>
                  {lp.tenLoaiPhong}
                </Option>
              ))}
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
          <Form.Item
            name="ghiChu"
            label="Ghi chú"
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Thêm phòng
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Chi tiết phòng"
        open={!!selectedPhong}
        onCancel={() => setSelectedPhong(null)}
        destroyOnHidden
        width={800}
      >
        {selectedPhong && (
          <div>
            <h3>Thông tin phòng</h3>
            <p><strong>Mã phòng:</strong> {selectedPhong.maPhong}</p>
            <p><strong>Tên phòng:</strong> {selectedPhong.tenPhong}</p>
            <p><strong>Loại phòng:</strong> {selectedPhong.tenLoaiPhong}</p>
            <p><strong>Trạng thái:</strong> <Tag color={getTrangThaiColor(selectedPhong.trangThai)}>{selectedPhong.trangThai}</Tag></p>
            <p><strong>Ghi chú:</strong> {selectedPhong.ghiChu || '-'}</p>

            <h3>Thông tin loại phòng</h3>
            <p><strong>Số người tối đa:</strong> {selectedPhong.soNguoiToiDa}</p>
            <p><strong>Giá cơ bản:</strong> {selectedPhong.giaCoBan?.toLocaleString('vi-VN')} VNĐ</p>

            {selectedPhong.danhSachDatPhong && selectedPhong.danhSachDatPhong.length > 0 && (
              <>
                <h3>Lịch sử đặt phòng</h3>
                <Table
                  dataSource={selectedPhong.danhSachDatPhong}
                  columns={[
                    {
                      title: 'Mã đặt phòng',
                      dataIndex: 'maDatPhong',
                      key: 'maDatPhong'
                    },
                    {
                      title: 'Ngày nhận phòng',
                      dataIndex: 'ngayNhanPhong',
                      key: 'ngayNhanPhong',
                      render: (text) => new Date(text).toLocaleString('vi-VN')
                    },
                    {
                      title: 'Ngày trả phòng',
                      dataIndex: 'ngayTraPhong',
                      key: 'ngayTraPhong',
                      render: (text) => new Date(text).toLocaleString('vi-VN')
                    },
                    {
                      title: 'Trạng thái',
                      dataIndex: 'trangThai',
                      key: 'trangThai'
                    }
                  ]}
                  pagination={false}
                />
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Phong;
