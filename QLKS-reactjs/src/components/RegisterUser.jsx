import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { apiFetch } from '../auth';
import './RegisterUser.css';

export default function RegisterUser() {
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
      const res = await apiFetch('http://localhost:5189/api/Auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      if (res.ok) {
        message.success('Đăng ký thành công!');
        form.resetFields();
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
    <div className="register-user-container">
      <h2>Đăng ký Khách hàng</h2>
      <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 400, margin: '0 auto' }}>
        <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', message: 'Nhập email hợp lệ!' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Mật khẩu" name="matKhau" rules={[{ required: true, message: 'Nhập mật khẩu!' }]}>
          <Input.Password autoComplete="new-password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Đăng ký
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
