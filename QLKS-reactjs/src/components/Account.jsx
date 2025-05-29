import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message } from 'antd';
import { apiFetch } from '../auth';
import './Account.css';

function Account() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [search, setSearch] = useState('');

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:5189/api/Account`;
      if (search) url = `http://localhost:5189/api/Account/${encodeURIComponent(search)}`;
      const res = await apiFetch(url);
      const data = await res.json();
      setAccounts(Array.isArray(data) ? data : (data ? [data] : []));
    } catch (e) {
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, [search]);

  const handleDelete = async (email) => {
    await apiFetch(`http://localhost:5189/api/Account/${encodeURIComponent(email)}`, { method: 'DELETE' });
    message.success('Xóa tài khoản thành công!');
    fetchAccounts();
  };

  const handleRestore = async (email) => {
    await apiFetch(`http://localhost:5189/api/Account/restore/${encodeURIComponent(email)}`, { method: 'PUT' });
    message.success('Khôi phục tài khoản thành công!');
    fetchAccounts();
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
    fetchAccounts();
  };

  const columns = [
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Tên nhân viên', dataIndex: 'hoTen', key: 'hoTen' },
    { title: 'Vai trò', dataIndex: 'vaiTro', key: 'vaiTro' },
    { title: 'Trạng thái', dataIndex: 'isActive', key: 'isActive', render: v => v ? 'Hoạt động' : 'Đã khóa' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button onClick={() => showEditModal(record)}>Sửa</Button>
          <Popconfirm title="Bạn chắc chắn xóa?" onConfirm={() => handleDelete(record.email)}>
            <Button danger>Xóa</Button>
          </Popconfirm>
          <Button onClick={() => handleRestore(record.email)}>Khôi phục</Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{padding: 24}}>
      <h2>Quản lý tài khoản</h2>
      <Space style={{marginBottom: 16}}>
        <Input.Search placeholder="Tìm kiếm theo tên" onSearch={setSearch} allowClear />
        <Button type="primary" onClick={showAddModal}>Thêm tài khoản</Button>
        <Button onClick={fetchAccounts}>Làm mới</Button>
      </Space>
      <Table columns={columns} dataSource={accounts} rowKey="email" loading={loading} />
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
          <Form.Item label="Vai trò" name="vaiTro" rules={[{ required: true, message: 'Chọn vai trò!' }]}> <Input /> </Form.Item>
          <Form.Item label="Mật khẩu" name="matKhau" rules={[{ required: !editingAccount, message: 'Nhập mật khẩu!' }]}> <Input.Password autoComplete="new-password" /> </Form.Item>
          <Form.Item> <Button type="primary" htmlType="submit">Lưu</Button> </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Account;
