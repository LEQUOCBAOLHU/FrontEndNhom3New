import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { apiFetch, saveAuthTokens } from '../auth';
import './LoginUser.css';

export default function LoginUser() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      if (!values.email || !values.matKhau) {
        message.error('Vui lòng nhập đầy đủ thông tin!');
        setLoading(false);
        return;
      }
      const res = await apiFetch('http://localhost:5189/api/Auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email, matKhau: values.matKhau })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        await saveAuthTokens(data.token, data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data));
        message.success('Đăng nhập thành công!');
        window.location.href = '/';
      } else {
        message.error(data.message || 'Đăng nhập thất bại!');
      }
    } catch (e) {
      message.error('Lỗi hệ thống!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-user-container">
      <h2>Đăng nhập Khách hàng</h2>
      <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 400, margin: '0 auto' }}>
        <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', message: 'Nhập email hợp lệ!' }]}> <Input /> </Form.Item>
        <Form.Item label="Mật khẩu" name="matKhau" rules={[{ required: true, message: 'Nhập mật khẩu!' }]}> <Input.Password autoComplete="current-password" /> </Form.Item>
        <Form.Item> <Button type="primary" htmlType="submit" loading={loading} block>Đăng nhập</Button> </Form.Item>
      </Form>
    </div>
  );
}
