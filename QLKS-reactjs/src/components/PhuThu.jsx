import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  TablePagination,
  MenuItem,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { phuThuService } from '../services/phuThuService';
import './PhuThu.css';

const PhuThu = () => {
  const [phuThuList, setPhuThuList] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedPhuThu, setSelectedPhuThu] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [formData, setFormData] = useState({
    maLoaiPhong: '',
    giaPhuThuTheoNgay: '',
    giaPhuThuTheoGio: '',
  });
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchPhuThu();
  }, [page, rowsPerPage]);

  const fetchPhuThu = async () => {
    setLoading(true);
    try {
      const response = await phuThuService.getAll(page + 1, rowsPerPage);
      setPhuThuList(response.data.phuThus || []);
      setTotalItems(response.data.totalItems || 0);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      showSnackbar('Lỗi khi tải danh sách phụ thu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.maLoaiPhong) {
      newErrors.maLoaiPhong = 'Loại phòng không được để trống';
    }
    if (!formData.giaPhuThuTheoNgay && !formData.giaPhuThuTheoGio) {
      newErrors.giaPhuThuTheoNgay = 'Ít nhất một loại giá phụ thu phải được nhập';
      newErrors.giaPhuThuTheoGio = 'Ít nhất một loại giá phụ thu phải được nhập';
    }
    if (formData.giaPhuThuTheoNgay && formData.giaPhuThuTheoNgay < 0) {
      newErrors.giaPhuThuTheoNgay = 'Giá phụ thu theo ngày không được âm';
    }
    if (formData.giaPhuThuTheoGio && formData.giaPhuThuTheoGio < 0) {
      newErrors.giaPhuThuTheoGio = 'Giá phụ thu theo giờ không được âm';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpen = (phuThu = null) => {
    if (phuThu) {
      setSelectedPhuThu(phuThu);
      setFormData({
        maLoaiPhong: phuThu.maLoaiPhong,
        giaPhuThuTheoNgay: phuThu.giaPhuThuTheoNgay || '',
        giaPhuThuTheoGio: phuThu.giaPhuThuTheoGio || '',
      });
    } else {
      setSelectedPhuThu(null);
      setFormData({
        maLoaiPhong: '',
        giaPhuThuTheoNgay: '',
        giaPhuThuTheoGio: '',
      });
    }
    setErrors({});
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPhuThu(null);
    setFormData({
      maLoaiPhong: '',
      giaPhuThuTheoNgay: '',
      giaPhuThuTheoGio: '',
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (selectedPhuThu) {
        await phuThuService.update(selectedPhuThu.maPhuThu, formData);
        showSnackbar('Cập nhật phụ thu thành công', 'success');
      } else {
        await phuThuService.create(formData);
        showSnackbar('Thêm phụ thu thành công', 'success');
      }
      fetchPhuThu();
      handleClose();
    } catch (error) {
      showSnackbar('Lỗi khi lưu phụ thu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (maPhuThu) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phụ thu này?')) {
      setLoading(true);
      try {
        await phuThuService.delete(maPhuThu);
        showSnackbar('Xóa phụ thu thành công', 'success');
        fetchPhuThu();
      } catch (error) {
        showSnackbar('Lỗi khi xóa phụ thu', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Quản lý Phụ thu
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Thêm phụ thu mới
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã phụ thu</TableCell>
                <TableCell>Loại phòng</TableCell>
                <TableCell>Giá phụ thu theo ngày</TableCell>
                <TableCell>Giá phụ thu theo giờ</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {phuThuList.map((phuThu) => (
                <TableRow key={phuThu.maPhuThu}>
                  <TableCell>{phuThu.maPhuThu}</TableCell>
                  <TableCell>{phuThu.tenLoaiPhong}</TableCell>
                  <TableCell>
                    {phuThu.giaPhuThuTheoNgay?.toLocaleString('vi-VN')} VNĐ
                  </TableCell>
                  <TableCell>
                    {phuThu.giaPhuThuTheoGio?.toLocaleString('vi-VN')} VNĐ
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpen(phuThu)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(phuThu.maPhuThu)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={totalItems}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Số hàng mỗi trang"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
          />
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedPhuThu ? 'Chỉnh sửa phụ thu' : 'Thêm phụ thu mới'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Mã loại phòng"
              type="number"
              value={formData.maLoaiPhong}
              onChange={(e) => setFormData({ ...formData, maLoaiPhong: e.target.value })}
              margin="normal"
              required
              error={!!errors.maLoaiPhong}
              helperText={errors.maLoaiPhong}
            />
            <TextField
              fullWidth
              label="Giá phụ thu theo ngày"
              type="number"
              value={formData.giaPhuThuTheoNgay}
              onChange={(e) => setFormData({ ...formData, giaPhuThuTheoNgay: e.target.value })}
              margin="normal"
              error={!!errors.giaPhuThuTheoNgay}
              helperText={errors.giaPhuThuTheoNgay}
              InputProps={{
                endAdornment: <span>VNĐ</span>,
              }}
            />
            <TextField
              fullWidth
              label="Giá phụ thu theo giờ"
              type="number"
              value={formData.giaPhuThuTheoGio}
              onChange={(e) => setFormData({ ...formData, giaPhuThuTheoGio: e.target.value })}
              margin="normal"
              error={!!errors.giaPhuThuTheoGio}
              helperText={errors.giaPhuThuTheoGio}
              InputProps={{
                endAdornment: <span>VNĐ</span>,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : selectedPhuThu ? (
              'Cập nhật'
            ) : (
              'Thêm mới'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PhuThu; 