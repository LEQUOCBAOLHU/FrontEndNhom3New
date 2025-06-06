import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select,
  Typography, Card, Row, Col, Statistic, Space, Tag, message, Popconfirm, DatePicker, Alert
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
    'Trống': 0,
    'Đang sử dụng': 0,
    'Bảo trì': 0
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
  const [dateRange, setDateRange] = useState([null, null]);
  const [isChecking, setIsChecking] = useState(false);
  const [checkProgress, setCheckProgress] = useState(null);
  const [filteredPhongs, setFilteredPhongs] = useState([]);
  const [allPhongs, setAllPhongs] = useState([]); // State để lưu trữ tất cả phòng

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

  const fetchRoomStats = async () => {
    try {
      const timestamp = new Date().getTime();
      const response = await apiFetch(`http://localhost:5189/api/Phong/thong-ke-trang-thai?t=${timestamp}`);
      if (response.ok) {
        const data = await response.json();
        // API trả về object với key là trạng thái và value là count
        // Ví dụ: { "data": { "Trống": 10, "Đang sử dụng": 5, "Bảo trì": 1 } }
        setRoomStats(data.data || { 'Trống': 0, 'Đang sử dụng': 0, 'Bảo trì': 0 });
      }
    } catch (error) {
      console.error('Error fetching room stats:', error);
    }
  };

  const fetchAllRooms = async () => {
    setLoading(true);
    try {
      // Thêm cache-busting parameter để đảm bảo dữ liệu luôn mới
      const timestamp = new Date().getTime();
      const response = await apiFetch(`http://localhost:5189/api/Phong?pageNumber=1&pageSize=999&t=${timestamp}`);
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data) ? data : (data.data?.phongs || []);
        const mapped = list.map(room => ({
          ...room,
          key: room.maPhong, // Thêm key cho React
          trangThai: room.trangThai || room.tinhTrang || '',
          tenPhong: room.tenPhong || room.TenPhong || '',
          maPhong: room.maPhong || room.MaPhong || '',
          tenLoaiPhong: room.tenLoaiPhong || room.TenLoaiPhong || ''
        }));
        setAllPhongs(mapped);
        setFilteredPhongs(mapped); // Ban đầu hiển thị tất cả
      }
    } catch (error) {
      console.error('Error fetching all rooms:', error);
      message.error('Lỗi khi tải danh sách phòng.');
    } finally {
      setLoading(false);
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
          key: room.maPhong,
          trangThai: room.trangThai || room.tinhTrang || '',
          tenPhong: room.tenPhong || room.TenPhong || '',
          maPhong: room.maPhong || room.MaPhong || '',
          tenLoaiPhong: room.tenLoaiPhong || room.TenLoaiPhong || ''
        }));
        setPhongs(mapped);
        
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
    // Thay vì fetchRooms, gọi fetchAllRooms
    fetchAllRooms();
    fetchLoaiPhongs();
    fetchRoomStats();
  }, []);

  // Effect để lọc lại dữ liệu khi filter thay đổi
  useEffect(() => {
    let newFilteredPhongs = [...allPhongs];

    // Lọc theo trạng thái
    if (filterTrangThai) {
      newFilteredPhongs = newFilteredPhongs.filter(p => p.trangThai === filterTrangThai);
    }
    
    setFilteredPhongs(newFilteredPhongs);

  }, [filterTrangThai, allPhongs]);

  const pieChartData = [
    { name: 'Phòng trống', value: roomStats['Trống'] || 0 },
    { name: 'Đang sử dụng', value: roomStats['Đang sử dụng'] || 0 },
    { name: 'Bảo trì', value: roomStats['Bảo trì'] || 0 },
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
    try {
      const response = await apiFetch(`http://localhost:5189/api/Phong/${selectedPhong.maPhong}/trang-thai`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trangThai: values.trangThai })
      });

      if (response.ok) {
        message.success('Cập nhật trạng thái phòng thành công!');
        await fetchAllRooms();
        await fetchRoomStats();
        setIsStatusModalVisible(false);
      } else {
        const errorData = await response.json();
        message.error(errorData.message || 'Cập nhật trạng thái thất bại.');
      }
    } catch (error) {
      message.error('Đã có lỗi xảy ra khi cố gắng cập nhật trạng thái.');
      console.error("Update status error:", error);
    }
  };

  const handleAddRoom = async (values) => {
    try {
      const response = await apiFetch('http://localhost:5189/api/Phong', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        return { success: true, message: 'Thêm phòng mới thành công!' };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Thêm phòng mới thất bại.' };
      }
    } catch (error) {
      message.error('Lỗi khi thêm phòng mới.');
      return { success: false, message: 'Không thể kết nối đến máy chủ.' };
    }
  };

  const showModal = (record = null) => {
    if (record) {
      setEditingId(record.maPhong);
      form.setFieldsValue({
        maPhong: record.maPhong,
        tenPhong: record.tenPhong,
        maLoaiPhong: record.maLoaiPhong,
        trangThai: record.trangThai
      });
    } else {
      setEditingId(null);
      // Khi thêm mới, phải cung cấp maPhong
      form.resetFields();
      form.setFieldsValue({ trangThai: 'Trống' });
    }
    setIsModalVisible(true);
  };

  const handleViewDetails = async (record) => {
    try {
        const response = await apiFetch(`http://localhost:5189/api/Phong/${record.maPhong}`);
        const data = await response.json();
        if(response.ok) {
            setSelectedPhong(data.data);
            setIsStatusModalVisible(true);
        } else {
            message.error(data.message || "Không thể lấy chi tiết phòng.");
        }
    } catch(err) {
        message.error("Lỗi khi lấy chi tiết phòng.");
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsStatusModalVisible(false);
    setSelectedPhong(null);
    form.resetFields();
    setEditingId(null);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      let result = {};

      if (editingId) {
        const response = await apiFetch(`http://localhost:5189/api/Phong/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        if (response.ok) {
          result = { success: true, message: 'Cập nhật phòng thành công!' };
        } else {
          const errorData = await response.json();
          result = { success: false, message: errorData.message || 'Cập nhật phòng thất bại.' };
        }
      } else {
        result = await handleAddRoom(values);
      }

      if (result.success) {
        message.success(result.message);
        
        if (editingId) {
          // --- Optimistic UI Update ---
          // 1. Cập nhật bảng dữ liệu
          const oldPhong = allPhongs.find(p => p.maPhong === editingId);
          const updatedPhongs = allPhongs.map(p => 
            p.maPhong === editingId ? { ...p, ...values } : p
          );
          setAllPhongs(updatedPhongs);

          // 2. Cập nhật các thẻ thống kê nếu trạng thái thay đổi
          if (oldPhong && oldPhong.trangThai !== values.trangThai) {
            const newStats = { ...roomStats };
            newStats[oldPhong.trangThai] = (newStats[oldPhong.trangThai] || 1) - 1;
            newStats[values.trangThai] = (newStats[values.trangThai] || 0) + 1;
            setRoomStats(newStats);
          }
        } else {
          // Nếu là thêm mới, cần fetch lại để có dữ liệu đầy đủ
          await fetchAllRooms();
          await fetchRoomStats();
        }
        
        setIsModalVisible(false);
        form.resetFields();
      } else {
        message.error(result.message);
      }

    } catch (info) {
      console.log('Validate Failed:', info);
    }
  };

  const handleDelete = async (maPhong) => {
    try {
      const response = await apiFetch(`http://localhost:5189/api/Phong/${maPhong}`, { method: 'DELETE' });
      if(response.ok){
        message.success('Xóa phòng thành công!');
        // Thay vì fetchRooms, gọi lại fetchAllRooms
        fetchAllRooms();
        fetchRoomStats();
      } else {
        const errorData = await response.json();
        message.error(errorData.message || 'Không thể xoá phòng này.');
      }
    } catch (error) {
      message.error('Lỗi khi xóa phòng.');
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const handleGlobalCheckAvailability = async () => {
    const [startDate, endDate] = dateRange;
    if (!startDate || !endDate) {
      message.warning('Vui lòng chọn cả ngày bắt đầu và ngày kết thúc.');
      return;
    }

    setIsChecking(true);
    setCheckProgress(0);

    try {
      let availableRooms = [];
      for (let i = 0; i < allPhongs.length; i++) {
        const phong = allPhongs[i];
        // Chỉ kiểm tra phòng "Trống" hoặc "Bảo trì" để xem có thể available không
        if (phong.trangThai === 'Đang sử dụng') continue;

        const response = await apiFetch(`http://localhost:5189/api/Phong/${phong.maPhong}`);
        const phongDetails = await response.json();
        
        const bookings = phongDetails.data?.chiTietDatPhongs || [];

        if (isAvailableOnClient(bookings, startDate, endDate)) {
          availableRooms.push(phong);
        }
        setCheckProgress(((i + 1) / allPhongs.length) * 100);
      }
      // Cập nhật lại danh sách phòng hiển thị là các phòng available
      setFilteredPhongs(availableRooms);
      message.success(`Tìm thấy ${availableRooms.length} phòng trống trong khoảng thời gian đã chọn.`);

    } catch (error) {
      console.error('Lỗi khi kiểm tra phòng trống:', error);
      message.error('Đã xảy ra lỗi trong quá trình kiểm tra.');
    } finally {
      setIsChecking(false);
      setCheckProgress(null);
    }
  };
  
  const isAvailableOnClient = (bookings, startDate, endDate) => {
    const checkStart = new Date(startDate);
    const checkEnd = new Date(endDate);

    for (const booking of bookings) {
      const bookingStart = new Date(booking.ngayNhan);
      const bookingEnd = new Date(booking.ngayTra);

      // Logic kiểm tra xung đột
      if (checkStart < bookingEnd && checkEnd > bookingStart) {
        return false; // Xung đột
      }
    }
    return true; // Không xung đột
  };

  const resetFilters = () => {
    setFilterTrangThai('');
    setDateRange([null, null]);
    setFilteredPhongs(allPhongs); // Hiển thị lại tất cả phòng
    message.info('Đã xóa bộ lọc.');
  };

  return (
    <div className="phong-container">
      <Title level={2} style={{ marginBottom: 24 }}>Quản lý Phòng</Title>

      {/* Thống kê và Biểu đồ */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={8}>
          <Card>
            <Title level={5}>Trạng thái phòng</Title>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
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

        <Col xs={24} lg={16}>
          <Card>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={12} md={6}>
                <Statistic
                  title="Tổng phòng"
                  value={(roomStats['Trống'] || 0) + (roomStats['Đang sử dụng'] || 0) + (roomStats['Bảo trì'] || 0)}
                />
              </Col>
              <Col xs={12} sm={12} md={6}>
                <Statistic
                  title="Trống"
                  value={roomStats['Trống'] || 0}
                  valueStyle={{ color: '#00C49F' }}
                />
              </Col>
              <Col xs={12} sm={12} md={6}>
                <Statistic
                  title="Sử dụng"
                  value={roomStats['Đang sử dụng'] || 0}
                  valueStyle={{ color: '#FF8042' }}
                />
              </Col>
              <Col xs={12} sm={12} md={6}>
                <Statistic
                  title="Bảo trì"
                  value={roomStats['Bảo trì'] || 0}
                  valueStyle={{ color: '#FFBB28' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Filter and Table Section */}
      <Card 
        title={<Title level={4} style={{ marginBottom: 0 }}>Danh sách phòng</Title>}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            Thêm phòng mới
          </Button>
        }
      >
        {/* Filter controls */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }} align="bottom">
          <Col xs={24} sm={12} md={8}>
            <Typography.Text>Trạng thái phòng</Typography.Text>
            <Select
              placeholder="Chọn trạng thái"
              style={{ width: '100%' }}
              value={filterTrangThai}
              onChange={(value) => setFilterTrangThai(value)}
              allowClear
            >
              <Option value="Trống">Phòng Trống</Option>
              <Option value="Đang sử dụng">Đang Sử Dụng</Option>
              <Option value="Bảo trì">Bảo Trì</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={10}>
            <Typography.Text>Kiểm tra phòng trống theo ngày</Typography.Text>
            <DatePicker.RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
            />
          </Col>
          <Col xs={24} sm={24} md={6}>
            <Space wrap>
              <Button
                type="primary"
                onClick={handleGlobalCheckAvailability}
                loading={isChecking}
              >
                Kiểm tra
              </Button>
              <Button onClick={resetFilters} icon={<ReloadOutlined />}>
                Reset
              </Button>
            </Space>
          </Col>
        </Row>

        {isChecking && (
          <Alert
            message={`Đang kiểm tra... (${checkProgress?.toFixed(0) || 0}%)`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {/* Room Table */}
        <Table
          columns={columns}
          dataSource={filteredPhongs}
          rowKey="maPhong"
          pagination={{ ...pagination, total: filteredPhongs.length }}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
        />
      </Card>


      {/* Modals */}
      <Modal
        title="Cập nhật trạng thái phòng"
        open={isStatusModalVisible}
        onCancel={() => setIsStatusModalVisible(false)}
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
        title={editingId ? "Sửa phòng" : "Thêm phòng mới"}
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={handleSubmit}
        destroyOnClose
        footer={[
          <Button key="back" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
            {editingId ? "Cập nhật" : "Thêm mới"}
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="maPhong"
            label="Mã phòng"
            rules={[{ required: true, message: 'Vui lòng nhập mã phòng!' }]}
          >
            <Input placeholder="Ví dụ: P101, P102..." disabled={!!editingId} />
          </Form.Item>
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
        </Form>
      </Modal>

      <Modal
        title="Chi tiết phòng"
        open={!!selectedPhong}
        onCancel={() => setSelectedPhong(null)}
        destroyOnClose
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
