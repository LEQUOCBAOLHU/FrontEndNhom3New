import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, DatePicker, Spin, message } from 'antd';
import { apiFetch } from '../auth';
import dayjs from 'dayjs';
import './DatPhongUser.css';

export default function DatPhongUser() {
  const [phongs, setPhongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPhongs();
  }, []);

  const fetchPhongs = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('http://localhost:5189/api/Phong?pageNumber=1&pageSize=100');
      const data = await res.json();
      let list = Array.isArray(data) ? data : (data.data?.phongs || data.phongs || data.Phongs || []);
      setPhongs(list);
    } catch (e) {
      setPhongs([]);
      message.error('Không thể lấy danh sách phòng!');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      if (!values.maPhong || !values.hoTen || !values.soDienThoai || !values.ngayNhanPhong || !values.ngayTraPhong) {
        message.error('Vui lòng nhập đầy đủ thông tin!');
        setLoading(false);
        return;
      }
      if (dayjs(values.ngayNhanPhong).isAfter(dayjs(values.ngayTraPhong))) {
        message.error('Ngày nhận phòng phải trước ngày trả phòng!');
        setLoading(false);
        return;
      }
      // Gửi yêu cầu đặt phòng (giả sử API /api/DatPhong cho khách hàng)
      const payload = {
        DatPhongVMs: [{
          MaPhong: values.maPhong,
          NgayNhanPhong: dayjs(values.ngayNhanPhong).format('YYYY-MM-DD HH:mm'),
          NgayTraPhong: dayjs(values.ngayTraPhong).format('YYYY-MM-DD HH:mm'),
          SoNguoiO: values.soNguoiO ? Number(values.soNguoiO) : 1,
          TrangThai: 'Đã đặt',
        }],
        MaKhList: [], // Backend sẽ tự tạo khách hàng mới nếu chưa có
        KhachHang: {
          HoTen: values.hoTen,
          SoDienThoai: values.soDienThoai,
          CccdPassport: values.cccdPassport || '',
          QuocTich: values.quocTich || '',
        }
      };
      const res = await apiFetch('http://localhost:5189/api/DatPhong/khach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        message.success('Đặt phòng thành công!');
        form.resetFields();
      } else {
        const data = await res.json();
        message.error(data.Message || 'Đặt phòng thất bại!');
      }
    } catch (e) {
      message.error('Lỗi hệ thống!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="datphong-user-container">
      <h2>Đặt phòng khách sạn</h2>
      <Spin spinning={loading}>
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 500, margin: '0 auto' }}>
          <Form.Item label="Họ tên" name="hoTen" rules={[{ required: true, message: 'Nhập họ tên!' }]}> <Input /> </Form.Item>
          <Form.Item label="Số điện thoại" name="soDienThoai" rules={[{ required: true, message: 'Nhập số điện thoại!' }]}> <Input /> </Form.Item>
          <Form.Item label="CCCD/Passport" name="cccdPassport"> <Input /> </Form.Item>
          <Form.Item label="Quốc tịch" name="quocTich"> <Input /> </Form.Item>
          <Form.Item label="Phòng" name="maPhong" rules={[{ required: true, message: 'Chọn phòng!' }]}> <Select placeholder="Chọn phòng">{phongs.map(p => <Select.Option key={p.maPhong} value={p.maPhong}>{p.tenPhong}</Select.Option>)}</Select> </Form.Item>
          <Form.Item label="Ngày nhận phòng" name="ngayNhanPhong" rules={[{ required: true, message: 'Chọn ngày nhận phòng!' }]}> <DatePicker showTime style={{ width: '100%' }} /> </Form.Item>
          <Form.Item label="Ngày trả phòng" name="ngayTraPhong" rules={[{ required: true, message: 'Chọn ngày trả phòng!' }]}> <DatePicker showTime style={{ width: '100%' }} /> </Form.Item>
          <Form.Item label="Số người ở" name="soNguoiO"> <Input type="number" min={1} max={10} /> </Form.Item>
          <Form.Item> <Button type="primary" htmlType="submit" block>Đặt phòng</Button> </Form.Item>
        </Form>
      </Spin>
    </div>
  );
}
