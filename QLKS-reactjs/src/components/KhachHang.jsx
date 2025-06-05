import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Typography,
  Card, Row, Col, Space, message, Tag, Select
} from 'antd';
import { 
  PlusOutlined, SearchOutlined, EditOutlined, 
  DeleteOutlined, ReloadOutlined, HistoryOutlined 
} from '@ant-design/icons';
import './KhachHang.css';
import { apiFetch } from '../auth';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

function KhachHang() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [khachHangs, setKhachHangs] = useState([]);
  const [selectedKhachHang, setSelectedKhachHang] = useState(null);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });
  const [historyData, setHistoryData] = useState([]);

  const fetchKhachHangs = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('http://localhost:5189/api/KhachHang?pageNumber=1&pageSize=100');
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data)
          ? data
          : (data.data?.khachHangs || data.khachHangs || data.KhachHangs || []);
        setKhachHangs(list);
        
        // Tính toán thống kê
        setStats({
          total: list.length,
          active: list.filter(kh => kh.isActive !== false).length,
          inactive: list.filter(kh => kh.isActive === false).length
        });
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      message.error('Lỗi khi tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKhachHangs();
  }, []);

  const handleAddCustomer = async (values) => {
    try {
      const response = await apiFetch('http://localhost:5189/api/KhachHang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        message.success('Thêm khách hàng mới thành công!');
        setIsModalVisible(false);
        form.resetFields();
        fetchKhachHangs();
      } else {
        message.error('Thêm khách hàng mới thất bại!');
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      message.error('Đã xảy ra lỗi khi thêm khách hàng mới!');
    }
  };

  const handleUpdateCustomer = async (values) => {
    if (!selectedKhachHang) return;
    try {
      const response = await apiFetch(`http://localhost:5189/api/KhachHang/${selectedKhachHang.hoTen}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        message.success('Cập nhật khách hàng thành công!');
        setIsModalVisible(false);
        form.resetFields();
        fetchKhachHangs();
      } else {
        message.error('Cập nhật khách hàng thất bại!');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      message.error('Đã xảy ra lỗi khi cập nhật khách hàng!');
    }
  };

  const handleDeleteCustomer = async (hoTen) => {
    try {
      const response = await apiFetch(`http://localhost:5189/api/KhachHang/${hoTen}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        message.success('Xóa khách hàng thành công!');
        fetchKhachHangs();
      } else {
        message.error('Xóa khách hàng thất bại!');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      message.error('Đã xảy ra lỗi khi xóa khách hàng!');
    }
  };

  const handleSearch = async (values) => {
    try {
      const response = await apiFetch(`http://localhost:5189/api/KhachHang/${values.hoTen}`);
      if (response.ok) {
        const data = await response.json();
        setKhachHangs(data.data || []);
        setIsSearchModalVisible(false);
        searchForm.resetFields();
      }
    } catch (error) {
      console.error('Error searching customers:', error);
      message.error('Đã xảy ra lỗi khi tìm kiếm khách hàng!');
    }
  };

  const handleViewHistory = async (hoTen) => {
    try {
      const response = await apiFetch(`http://localhost:5189/api/HoaDon/khach-hang/${hoTen}?pageNumber=1&pageSize=100`);
      if (response.ok) {
        const data = await response.json();
        setHistoryData(data.data?.hoaDons || []);
        setIsHistoryModalVisible(true);
      }
    } catch (error) {
      console.error('Error fetching customer history:', error);
      message.error('Đã xảy ra lỗi khi tải lịch sử khách hàng!');
    }
  };

  const columns = [
    {
      title: 'Mã khách hàng',
      dataIndex: 'maKh',
      key: 'maKh',
      sorter: (a, b) => a.maKh - b.maKh,
    },
    {
      title: 'Họ tên',
      dataIndex: 'hoTen',
      key: 'hoTen',
      sorter: (a, b) => a.hoTen.localeCompare(b.hoTen),
    },
    {
      title: 'CCCD/Passport',
      dataIndex: 'cccdPassport',
      key: 'cccdPassport',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'soDienThoai',
      key: 'soDienThoai',
    },
    {
      title: 'Quốc tịch',
      dataIndex: 'quocTich',
      key: 'quocTich',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'ghiChu',
      key: 'ghiChu',
      ellipsis: true,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedKhachHang(record);
              form.setFieldsValue(record);
              setIsModalVisible(true);
            }}
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteCustomer(record.hoTen)}
          >
            Xóa
          </Button>
          <Button
            icon={<HistoryOutlined />}
            onClick={() => handleViewHistory(record.hoTen)}
          >
            Lịch sử
          </Button>
        </Space>
      ),
    },
  ];

  const historyColumns = [
    {
      title: 'Mã hóa đơn',
      dataIndex: 'maHoaDon',
      key: 'maHoaDon',
    },
    {
      title: 'Ngày lập',
      dataIndex: 'ngayLap',
      key: 'ngayLap',
      render: (text) => text ? new Date(text).toLocaleDateString() : '',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'tongTien',
      key: 'tongTien',
      render: (text) => `${text?.toLocaleString()} VNĐ`,
    },
    {
      title: 'Phương thức thanh toán',
      dataIndex: 'phuongThucThanhToan',
      key: 'phuongThucThanhToan',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      render: (text) => (
        <Tag color={text === 'Đã thanh toán' ? 'green' : 'orange'}>
          {text}
        </Tag>
      ),
    },
  ];

  return (
    <div className="khachhang-container">
      <Title level={2} className="page-title">Quản lý Khách hàng</Title>

      {/* Stats Section */}
      <Row gutter={[16, 16]} className="stats-section">
        <Col xs={24} sm={8}>
          <Card className="stat-card">
            <Title level={4}>Tổng số khách hàng</Title>
            <div className="stat-value">{stats.total}</div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="stat-card">
            <Title level={4}>Đang hoạt động</Title>
            <div className="stat-value">{stats.active}</div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="stat-card">
            <Title level={4}>Ngừng hoạt động</Title>
            <div className="stat-value">{stats.inactive}</div>
          </Card>
        </Col>
      </Row>

      {/* Action Buttons */}
      <div className="action-buttons">
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedKhachHang(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            Thêm khách hàng mới
          </Button>
          <Button
            icon={<SearchOutlined />}
            onClick={() => setIsSearchModalVisible(true)}
          >
            Tìm kiếm
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchKhachHangs}
          >
            Làm mới
          </Button>
        </Space>
      </div>

      {/* Customers Table */}
      <Card className="table-card">
        <Table
          columns={columns}
          dataSource={khachHangs}
          rowKey="maKh"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} khách hàng`
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={selectedKhachHang ? 'Cập nhật khách hàng' : 'Thêm khách hàng mới'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={selectedKhachHang ? handleUpdateCustomer : handleAddCustomer}
        >
          <Form.Item
            name="hoTen"
            label="Họ tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="cccdPassport"
            label="CCCD/Passport"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="soDienThoai"
            label="Số điện thoại"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="quocTich"
            label="Quốc tịch"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="ghiChu"
            label="Ghi chú"
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {selectedKhachHang ? 'Cập nhật' : 'Thêm mới'}
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Search Modal */}
      <Modal
        title="Tìm kiếm khách hàng"
        open={isSearchModalVisible}
        onCancel={() => {
          setIsSearchModalVisible(false);
          searchForm.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={searchForm}
          layout="vertical"
          onFinish={handleSearch}
        >
          <Form.Item
            name="hoTen"
            label="Họ tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên cần tìm!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Tìm kiếm
              </Button>
              <Button onClick={() => {
                setIsSearchModalVisible(false);
                searchForm.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* History Modal */}
      <Modal
        title="Lịch sử khách hàng"
        open={isHistoryModalVisible}
        onCancel={() => setIsHistoryModalVisible(false)}
        width={1000}
        footer={null}
      >
        <Table
          columns={historyColumns}
          dataSource={historyData}
          rowKey="maHoaDon"
          pagination={{
            pageSize: 5,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} hóa đơn`
          }}
        />
      </Modal>
    </div>
  );
}

export default KhachHang;
