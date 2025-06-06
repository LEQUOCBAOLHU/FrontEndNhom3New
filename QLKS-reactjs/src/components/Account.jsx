import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message, Select, Tag } from 'antd';
import { apiFetch } from '../auth';
import './Account.css';
import { useTheme } from '../contexts/ThemeContext';
import { EditOutlined, KeyOutlined } from '@ant-design/icons';

const { Option } = Select;

function Account() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const { isDarkMode } = useTheme();

  const fetchAccounts = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      let url = search
        ? `http://localhost:5189/api/Account/by-name?hoTen=${encodeURIComponent(search)}`
        : `http://localhost:5189/api/Account?pageNumber=${page}&pageSize=${pageSize}`;
        
      const res = await apiFetch(url);
      const data = await res.json();
      
      if (data && data.data) {
        if (search) {
          setAccounts(data.data);
          setPagination(prev => ({ ...prev, total: data.data.length, current: 1 }));
        } else {
          setAccounts(data.data.accounts || []);
          setPagination({
            current: data.data.currentPage,
            pageSize: data.data.pageSize,
            total: data.data.totalItems,
          });
        }
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
    setIsModalVisible(true);
  };

  const showAddModal = () => {
    setEditingAccount(null);
    setIsModalVisible(true);
  };

  const handleOk = async (values) => {
    if (editingAccount) {
      // Sửa tài khoản
      await apiFetch(`http://localhost:5189/api/Account/${encodeURIComponent(editingAccount.email)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      message.success('Cập nhật tài khoản thành công!');
    } else {
      // Thêm tài khoản
      await apiFetch('http://localhost:5189/api/Account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      message.success('Thêm tài khoản thành công!');
    }
    setIsModalVisible(false);
    fetchAccounts(pagination.current, pagination.pageSize);
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
    { title: 'Vai trò', dataIndex: 'vaiTro', key: 'vaiTro' },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
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
    <div style={{padding: 24}}>
      <h2>Quản lý tài khoản</h2>
      <Space style={{marginBottom: 16}}>
        <Input.Search 
          placeholder="Tìm kiếm theo tên nhân viên" 
          onSearch={value => {
            setSearch(value);
            // Reset to page 1 for new search
            setPagination(prev => ({ ...prev, current: 1 })); 
          }} 
          allowClear 
        />
        <Button type="primary" onClick={showAddModal}>Thêm tài khoản</Button>
      </Space>
      <Table 
        columns={columns} 
        dataSource={accounts} 
        rowKey="email" 
        loading={loading} 
        pagination={pagination}
        onChange={handleTableChange}
      />
      <Modal
        title={editingAccount ? 'Sửa tài khoản' : 'Thêm tài khoản'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          layout="vertical"
          initialValues={editingAccount || {}}
          onFinish={handleOk}
        >
          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', message: 'Nhập email hợp lệ!' }]}> <Input disabled={!!editingAccount} /> </Form.Item>
          <Form.Item label="Tên nhân viên" name="hoTen" rules={[{ required: true, message: 'Nhập tên nhân viên!' }]}> <Input /> </Form.Item>
          <Form.Item label="Vai trò" name="vaiTro" rules={[{ required: true, message: 'Chọn vai trò!' }]}>
            <Select placeholder="Chọn vai trò">
              <Option value="QuanLy">Quản lý</Option>
              <Option value="NhanVien">Nhân viên</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Mật khẩu" name="matKhau" rules={[{ required: !editingAccount, message: 'Nhập mật khẩu!' }]}> <Input.Password autoComplete="new-password" /> </Form.Item>
          <Form.Item> <Button type="primary" htmlType="submit">Lưu</Button> </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Account;
