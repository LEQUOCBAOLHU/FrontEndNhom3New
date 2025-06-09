import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message, Select, Tag, Row, Col, Card, Typography } from 'antd';
import { apiFetch } from '../auth';
import './Account.css';
import { useTheme } from '../contexts/ThemeContext';
import { EditOutlined, KeyOutlined, PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title } = Typography;

function Account() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [search, setSearch] = useState('');
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const { isDarkMode } = useTheme();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  const fetchAccounts = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      let url = search
        ? `http://localhost:5189/api/Account/by-name?hoTen=${encodeURIComponent(search)}`
        : `http://localhost:5189/api/Account?pageNumber=${page}&pageSize=${pageSize}`;
        
      const res = await apiFetch(url);
      const data = await res.json();
      
      if (data && data.data) {
        let accountsList = [];
        if (search) {
          accountsList = data.data;
          setPagination(prev => ({ ...prev, total: data.data.length, current: 1 }));
        } else {
          accountsList = data.data.accounts || [];
          setPagination({
            current: data.data.currentPage,
            pageSize: data.data.pageSize,
            total: data.data.totalItems,
          });
        }
        setAccounts(accountsList);
        // Update stats
        setStats({
          total: accountsList.length,
          active: accountsList.filter(acc => acc.isActive !== false).length,
          inactive: accountsList.filter(acc => acc.isActive === false).length,
        });
      } else {
        setAccounts([]);
        message.error('Không tìm thấy dữ liệu.');
      }
    } catch (e) {
      setAccounts([]);
      message.error('Lỗi khi tải dữ liệu tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts(pagination.current, pagination.pageSize);
  }, [search]);
  
  const handleTableChange = (newPagination) => {
    fetchAccounts(newPagination.current, newPagination.pageSize);
  };

  const handleDelete = async (email) => {
    await apiFetch(`http://localhost:5189/api/Account/${encodeURIComponent(email)}`, { method: 'DELETE' });
    message.success('Vô hiệu hóa tài khoản thành công!');
    fetchAccounts(pagination.current, pagination.pageSize);
  };

  const handleRestore = async (email) => {
    await apiFetch(`http://localhost:5189/api/Account/restore/${encodeURIComponent(email)}`, { method: 'PUT' });
    message.success('Khôi phục tài khoản thành công!');
    fetchAccounts(pagination.current, pagination.pageSize);
  };

  const showEditModal = (record) => {
    setEditingAccount(record);
    // Định dạng ngày sinh trước khi set vào form
    const formattedRecord = {
      ...record,
      ngaySinh: record.ngaySinh ? new Date(record.ngaySinh).toISOString().split('T')[0] : undefined
    };
    form.setFieldsValue(formattedRecord);
    setIsModalVisible(true);
  };

  const showAddModal = () => {
    setEditingAccount(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleOk = async (values) => {
    try {
      // Format date to YYYY-MM-DD for DateOnly
      const formattedDate = values.ngaySinh ? values.ngaySinh.split('T')[0] : null;

      const formData = {
        email: values.email,
        hoTen: values.hoTen,
        maVaiTro: Number(values.maVaiTro), // Ensure it's a number
        soDienThoai: values.soDienThoai || null,
        gioiTinh: values.gioiTinh || null,
        diaChi: values.diaChi || null,
        ngaySinh: formattedDate
      };

      // Let's log the data being sent to verify
      console.log('Sending data:', formData);

      if (editingAccount) {
        // Sửa tài khoản
        const res = await apiFetch(`https://localhost:7274/api/Account/${encodeURIComponent(editingAccount.email)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Lỗi khi cập nhật tài khoản');
        }

        message.success('Cập nhật tài khoản thành công!');
      } else {
        // Thêm tài khoản
        const res = await apiFetch('https://localhost:7274/api/Account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Lỗi khi thêm tài khoản');
        }

        message.success('Thêm tài khoản thành công!');
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingAccount(null);
      // Fetch lại dữ liệu với trang hiện tại
      await fetchAccounts(pagination.current, pagination.pageSize);

    } catch (error) {
      message.error(error.message);
    }
  };

  const handleResetPassword = (email) => {
    Modal.confirm({
      title: 'Bạn có chắc muốn reset mật khẩu?',
      content: `Một mật khẩu mới sẽ được tạo và gửi đến email: ${email}. Hành động này không thể hoàn tác.`,
      okText: 'Reset',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const res = await apiFetch('http://localhost:5189/api/auth/password/reset', {
            method: 'POST',
            body: JSON.stringify({ email })
          });
          const data = await res.json();
          if (res.ok) {
            message.success(data.message || 'Mật khẩu đã được reset và gửi qua email.');
          } else {
            message.error(data.message || 'Reset mật khẩu thất bại.');
          }
        } catch (error) {
          message.error('Lỗi kết nối đến máy chủ.');
        }
      }
    });
  };

  const columns = [
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Tên nhân viên', dataIndex: 'hoTen', key: 'hoTen' },
    { title: 'Vai trò', key: 'vaiTro', render: (_, record) => {
      const ma = record.maVaiTro ?? record.MaVaiTro;
      if (ma === 1) return 'Nhân viên';
      if (ma === 2) return 'Quản lý';
      return '';
    } },
    { title: 'Số điện thoại', dataIndex: 'soDienThoai', key: 'soDienThoai' },
    { title: 'Giới tính', dataIndex: 'gioiTinh', key: 'gioiTinh' },
    { title: 'Địa chỉ', dataIndex: 'diaChi', key: 'diaChi' },
    { title: 'Ngày sinh', dataIndex: 'ngaySinh', key: 'ngaySinh', render: (ngaySinh) => ngaySinh ? new Date(ngaySinh).toLocaleDateString() : '' },
    {
      title: 'Trạng thái',
      key: 'isActive',
      render: () => (
        <Tag color="green">
          Hoạt động
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" ghost onClick={() => showEditModal(record)}>
            <EditOutlined /> Sửa
          </Button>
          <Button type="default" danger onClick={() => handleResetPassword(record.email)}>
            <KeyOutlined /> Reset Mật khẩu
          </Button>
        </Space>
      ),
    }
  ];

  return (
    <div className="account-container">
      <Title level={2}>Quản lý tài khoản</Title>

      {/* Stats Section */}
      <Row gutter={[16, 16]} className="stats-section">
        <Col xs={24} sm={8}>
          <Card className="stat-card">
            <Title level={4}>Tổng số tài khoản</Title>
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
              setEditingAccount(null);
              setIsModalVisible(true);
            }}
          >
            Thêm tài khoản mới
          </Button>
          <Input.Search 
            placeholder="Tìm kiếm theo tên nhân viên" 
            onSearch={value => {
              setSearch(value);
              setPagination(prev => ({ ...prev, current: 1 })); 
            }} 
            allowClear
            prefix={<SearchOutlined />}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchAccounts(pagination.current, pagination.pageSize)}
          >
            Làm mới
          </Button>
        </Space>
      </div>

      {/* Table Card */}
      <Card className="table-card">
        <Table 
          columns={columns} 
          dataSource={accounts} 
          rowKey="email" 
          loading={loading} 
          pagination={{
            ...pagination,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} tài khoản`
          }}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title={editingAccount ? 'Sửa tài khoản' : 'Thêm tài khoản'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingAccount(null);
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleOk}
          initialValues={{
            ...editingAccount,
            ngaySinh: editingAccount?.ngaySinh ? new Date(editingAccount.ngaySinh).toISOString().split('T')[0] : undefined
          }}
        >
          <Form.Item 
            label="Email" 
            name="email" 
            rules={[{ required: true, type: 'email', message: 'Nhập email hợp lệ!' }]}
          >
            <Input disabled={!!editingAccount} />
          </Form.Item>
          <Form.Item 
            label="Tên nhân viên" 
            name="hoTen" 
            rules={[{ required: true, message: 'Nhập tên nhân viên!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item 
            label="Vai trò" 
            name="maVaiTro" 
            rules={[{ required: true, message: 'Chọn vai trò!' }]}
          >
            <Select placeholder="Chọn vai trò">
              <Option value={1}>Nhân viên</Option>
              <Option value={2}>Quản lý</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Số điện thoại" name="soDienThoai">
            <Input />
          </Form.Item>
          <Form.Item label="Giới tính" name="gioiTinh">
            <Select placeholder="Chọn giới tính">
              <Option value="Nam">Nam</Option>
              <Option value="Nữ">Nữ</Option>
              <Option value="Khác">Khác</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Địa chỉ" name="diaChi">
            <Input />
          </Form.Item>
          <Form.Item label="Ngày sinh" name="ngaySinh">
            <Input type="date" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingAccount ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Account;
