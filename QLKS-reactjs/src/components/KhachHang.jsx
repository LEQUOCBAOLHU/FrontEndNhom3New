import React, { useEffect, useState } from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, CircularProgress, Alert, Box } from '@mui/material';
import { apiFetch } from '../auth';
import './KhachHang.css';
import { Modal, Form, Input, Button, Select, message } from 'antd';

const { Option } = Select;

function KhachHang() {
  const [khachHangs, setKhachHangs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Lấy id nhân viên từ localStorage (sau khi login backend đã trả về)
  const nhanVienId = localStorage.getItem('nhanVienId');

  useEffect(() => {
    const fetchKhachHangs = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiFetch('http://localhost:5189/api/KhachHang?pageNumber=1&pageSize=10');
        const data = await res.json();
        // Lấy đúng mảng khách hàng từ backend (dạng phân trang)
        const list = Array.isArray(data)
          ? data
          : (data.data?.khachHangs || data.khachHangs || data.KhachHangs || []);
        setKhachHangs(list);
      } catch (e) {
        setKhachHangs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchKhachHangs();
  }, []);

  const handleAddEditKhachHang = async (values) => {
    // Khi tạo mới, gửi idNhanVien, không gửi maDatPhong
    const body = { ...values, idNhanVien: nhanVienId };
    await apiFetch('http://localhost:5189/api/KhachHang', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    setIsModalVisible(false);
    // Làm mới danh sách khách hàng
    const res = await apiFetch('http://localhost:5189/api/KhachHang?pageNumber=1&pageSize=10');
    const data = await res.json();
    const list = Array.isArray(data)
      ? data
      : (data.data?.khachHangs || data.khachHangs || data.KhachHangs || []);
    setKhachHangs(list);
    message.success('Thêm/sửa khách hàng thành công!');
  };

  return (
    <div className="khach-hang-container">
      <Typography variant="h5" gutterBottom>Quản lý Khách hàng</Typography>
      {loading && <Box sx={{display:'flex',justifyContent:'center',my:4}}><CircularProgress /></Box>}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
          <Table stickyHeader aria-label="bảng khách hàng">
            <TableHead>
              <TableRow>
                <TableCell>Mã KH</TableCell>
                <TableCell>Họ tên</TableCell>
                <TableCell>Số điện thoại</TableCell>
                <TableCell>CCCD/Passport</TableCell>
                <TableCell>Quốc tịch</TableCell>
                <TableCell>Ghi chú</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(khachHangs) && khachHangs.map((kh) => (
                <TableRow key={kh.maKh || kh.hoTen} hover>
                  <TableCell>{kh.maKh || ''}</TableCell>
                  <TableCell>{kh.hoTen}</TableCell>
                  <TableCell>{kh.soDienThoai}</TableCell>
                  <TableCell>{kh.cccdPassport}</TableCell>
                  <TableCell>{kh.quocTich}</TableCell>
                  <TableCell>{kh.ghiChu}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal thêm/sửa khách hàng */}
      <Modal
        title="Thêm/Sửa Khách Hàng"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleAddEditKhachHang}>
          <Form.Item label="Họ tên" name="hoTen" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
            <Input placeholder="Nhập họ tên" />
          </Form.Item>
          <Form.Item label="Quốc tịch" name="quocTich" rules={[{ required: true, message: 'Vui lòng chọn quốc tịch' }]}>
            <Select placeholder="Chọn quốc tịch">
              <Option value="Việt Nam">Việt Nam</Option>
              <Option value="Nước ngoài">Nước ngoài</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Trạng thái" name="trangThai" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select placeholder="Chọn trạng thái">
              <Option value="Đang ở">Đang ở</Option>
              <Option value="Đã trả phòng">Đã trả phòng</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Lưu</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default KhachHang;
