import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { apiFetch } from '../auth';

const ChangePassword = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await apiFetch('http://localhost:5189/api/Auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      if (res.ok) {
        message.success('Đổi mật khẩu thành công!');
      } else {
        const data = await res.json();
        message.error(data.Message || 'Đổi mật khẩu thất bại!');
      }
    } catch (e) {
      message.error('Lỗi hệ thống!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8 }}>
      <h2>Đổi mật khẩu</h2>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', message: 'Nhập email hợp lệ!' }]}> <Input /> </Form.Item>
        <Form.Item label="Mật khẩu cũ" name="oldPassword" rules={[{ required: true, message: 'Nhập mật khẩu cũ!' }]}> <Input.Password /> </Form.Item>
        <Form.Item label="Mật khẩu mới" name="newPassword" rules={[{ required: true, message: 'Nhập mật khẩu mới!' }]}> <Input.Password autoComplete="new-password" /> </Form.Item>
        <Form.Item> <Button type="primary" htmlType="submit" loading={loading}>Đổi mật khẩu</Button> </Form.Item>
      </Form>
    </div>
  );
};

export default ChangePassword;
