import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../auth';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await apiFetch('http://localhost:5189/api/Auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      if (res.ok) {
        message.success('Đăng ký thành công!');
        navigate('/login');
      } else {
        const data = await res.json();
        message.error(data.Message || 'Đăng ký thất bại!');
      }
    } catch (e) {
      message.error('Lỗi hệ thống!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8 }}>
      <h2>Đăng ký tài khoản</h2>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', message: 'Nhập email hợp lệ!' }]}> <Input /> </Form.Item>
        <Form.Item label="Mật khẩu" name="matKhau" rules={[{ required: true, message: 'Nhập mật khẩu!' }]}> <Input.Password autoComplete="new-password" /> </Form.Item>
        <Form.Item> <Button type="primary" htmlType="submit" loading={loading}>Đăng ký</Button> </Form.Item>
      </Form>
    </div>
  );
};

export default Register;
