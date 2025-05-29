import React, { useState } from 'react';
import { Form, Input, Button, message, Spin } from 'antd';
import { apiFetch } from '../auth';
import './LoginAdmin.css';

export default function LoginAdmin() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const res = await apiFetch('http://localhost:5189/api/Auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email, password: values.password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data));
        message.success('Đăng nhập thành công!');
        window.location.href = '/dashboard';
      } else {
        message.error(data.message || 'Đăng nhập thất bại!');
      }
    } catch (e) {
      message.error('Lỗi kết nối máy chủ!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-admin-container">
      <h2>Đăng nhập Quản trị viên</h2>
      <Spin spinning={loading}>
        <Form form={form} layout="vertical" onFinish={handleLogin}>
          <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Nhập email!' }]}> 
            <Input autoFocus placeholder="Email quản trị" />
          </Form.Item>
          <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: 'Nhập mật khẩu!' }]}> 
            <Input.Password placeholder="Mật khẩu" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>Đăng nhập</Button>
          </Form.Item>
        </Form>
      </Spin>
    </div>
  );
}
