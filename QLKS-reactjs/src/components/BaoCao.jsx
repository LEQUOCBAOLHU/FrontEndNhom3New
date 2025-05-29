import React, { useEffect, useState } from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, CircularProgress, Alert, Box } from '@mui/material';
import { apiFetch } from '../auth';
import './BaoCao.css';

function BaoCao() {
  const [hoaDons, setHoaDons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHoaDons = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiFetch('http://localhost:5189/api/HoaDon');
        if (!res.ok) throw new Error('Không thể lấy dữ liệu hóa đơn');
        const data = await res.json();
        setHoaDons(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    };
    fetchHoaDons();
  }, []);

  return (
    <Box className="bao-cao-container">
      <Typography variant="h5" gutterBottom className="bao-cao-title">Báo cáo hóa đơn</Typography>
      {loading && <Box className="loading-container"><CircularProgress /></Box>}
      {error && <Alert severity="error" className="error-alert">{error}</Alert>}
      {!loading && !error && (
        <TableContainer component={Paper} className="table-container" sx={{ maxHeight: 500 }}>
          <Table stickyHeader aria-label="bảng hóa đơn" className="table">
            <TableHead>
              <TableRow>
                <TableCell className="table-header-cell">Mã hóa đơn</TableCell>
                <TableCell className="table-header-cell">Khách hàng</TableCell>
                <TableCell className="table-header-cell">Nhân viên</TableCell>
                <TableCell className="table-header-cell">Ngày lập</TableCell>
                <TableCell className="table-header-cell">Tổng tiền</TableCell>
                <TableCell className="table-header-cell">Phương thức</TableCell>
                <TableCell className="table-header-cell">Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(hoaDons) && hoaDons.map((hd) => (
                <TableRow key={hd.maHoaDon} hover className="table-row">
                  <TableCell className="table-cell">{hd.maHoaDon}</TableCell>
                  <TableCell className="table-cell">{hd.tenKhachHang}</TableCell>
                  <TableCell className="table-cell">{hd.tenNhanVien}</TableCell>
                  <TableCell className="table-cell">{hd.ngayLap}</TableCell>
                  <TableCell className="table-cell tong-tien">{hd.tongTien?.toLocaleString('vi-VN')}</TableCell>
                  <TableCell className="table-cell">{hd.phuongThucThanhToan}</TableCell>
                  <TableCell className="table-cell trang-thai">{hd.trangThai}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default BaoCao;
