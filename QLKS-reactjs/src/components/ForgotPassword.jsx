import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { apiFetch } from '../auth';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await apiFetch('http://localhost:5189/api/Auth/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      if (res.ok) {
        message.success('Đã gửi yêu cầu đặt lại mật khẩu!');
        setSent(true);
      } else {
        const data = await res.json();
        message.error(data.Message || 'Gửi yêu cầu thất bại!');
      }
    } catch (e) {
      message.error('Lỗi hệ thống!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8 }}>
      <h2>Quên mật khẩu</h2>
      {sent ? <p>Vui lòng kiểm tra email để đặt lại mật khẩu.</p> : (
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', message: 'Nhập email hợp lệ!' }]}> <Input /> </Form.Item>
          <Form.Item> <Button type="primary" htmlType="submit" loading={loading}>Gửi yêu cầu</Button> </Form.Item>
        </Form>
      )}
    </div>
  );
};

export default ForgotPassword;
