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
  InputAdornment,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { loaiPhongService } from '../services/loaiPhongService';
import './LoaiPhong.css';

const LoaiPhong = () => {
  const [loaiPhongList, setLoaiPhongList] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedLoaiPhong, setSelectedLoaiPhong] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [formData, setFormData] = useState({
    tenLoaiPhong: '',
    giaCoBan: '',
    soNguoiToiDa: '',
    moTa: '',
  });
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchLoaiPhong();
  }, [page, rowsPerPage]);

  const fetchLoaiPhong = async () => {
    setLoading(true);
    try {
      const response = await loaiPhongService.getAll(page + 1, rowsPerPage);
      setLoaiPhongList(response.data?.loaiPhongs || []);
      setTotalItems(response.data?.totalItems || 0);
      setTotalPages(response.data?.totalPages || 0);
    } catch (error) {
      showSnackbar('Lỗi khi tải danh sách loại phòng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.tenLoaiPhong) {
      newErrors.tenLoaiPhong = 'Tên loại phòng không được để trống';
    }
    if (!formData.giaCoBan) {
      newErrors.giaCoBan = 'Giá cơ bản không được để trống';
    }
    if (formData.giaCoBan && formData.giaCoBan < 0) {
      newErrors.giaCoBan = 'Giá cơ bản không được âm';
    }
    if (!formData.soNguoiToiDa) {
      newErrors.soNguoiToiDa = 'Số người tối đa không được để trống';
    }
    if (formData.soNguoiToiDa && formData.soNguoiToiDa < 1) {
      newErrors.soNguoiToiDa = 'Số người tối đa phải lớn hơn 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpen = (loaiPhong = null) => {
    if (loaiPhong) {
      setSelectedLoaiPhong(loaiPhong);
      setFormData({
        tenLoaiPhong: loaiPhong.tenLoaiPhong,
        giaCoBan: loaiPhong.giaCoBan || '',
        soNguoiToiDa: loaiPhong.soNguoiToiDa || '',
        moTa: loaiPhong.moTa || '',
      });
    } else {
      setSelectedLoaiPhong(null);
      setFormData({
        tenLoaiPhong: '',
        giaCoBan: '',
        soNguoiToiDa: '',
        moTa: '',
      });
    }
    setErrors({});
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedLoaiPhong(null);
    setFormData({
      tenLoaiPhong: '',
      giaCoBan: '',
      soNguoiToiDa: '',
      moTa: '',
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (selectedLoaiPhong) {
        await loaiPhongService.update(selectedLoaiPhong.maLoaiPhong, formData);
        showSnackbar('Cập nhật loại phòng thành công', 'success');
      } else {
        await loaiPhongService.create(formData);
        showSnackbar('Thêm loại phòng thành công', 'success');
      }
      fetchLoaiPhong();
      handleClose();
    } catch (error) {
      showSnackbar('Lỗi khi lưu loại phòng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (maLoaiPhong) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa loại phòng này?')) {
      setLoading(true);
      try {
        await loaiPhongService.delete(maLoaiPhong);
        showSnackbar('Xóa loại phòng thành công', 'success');
        fetchLoaiPhong();
      } catch (error) {
        showSnackbar('Lỗi khi xóa loại phòng', 'error');
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
          Quản lý Loại Phòng
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Thêm loại phòng mới
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
                <TableCell>Mã loại phòng</TableCell>
                <TableCell>Tên loại phòng</TableCell>
                <TableCell>Giá cơ bản</TableCell>
                <TableCell>Số người tối đa</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loaiPhongList.map((loaiPhong) => (
                <TableRow key={loaiPhong.maLoaiPhong}>
                  <TableCell>{loaiPhong.maLoaiPhong}</TableCell>
                  <TableCell>{loaiPhong.tenLoaiPhong}</TableCell>
                  <TableCell>{loaiPhong.giaCoBan?.toLocaleString('vi-VN')} VNĐ</TableCell>
                  <TableCell>{loaiPhong.soNguoiToiDa}</TableCell>
                  <TableCell>{loaiPhong.moTa}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpen(loaiPhong)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(loaiPhong.maLoaiPhong)} color="error">
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
          {selectedLoaiPhong ? 'Chỉnh sửa loại phòng' : 'Thêm loại phòng mới'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Tên loại phòng"
              value={formData.tenLoaiPhong}
              onChange={(e) => setFormData({ ...formData, tenLoaiPhong: e.target.value })}
              margin="normal"
              required
              error={!!errors.tenLoaiPhong}
              helperText={errors.tenLoaiPhong}
            />
            <TextField
              fullWidth
              label="Giá cơ bản"
              type="number"
              value={formData.giaCoBan}
              onChange={(e) => setFormData({ ...formData, giaCoBan: e.target.value })}
              margin="normal"
              required
              error={!!errors.giaCoBan}
              helperText={errors.giaCoBan}
              InputProps={{
                endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>,
              }}
            />
            <TextField
              fullWidth
              label="Số người tối đa"
              type="number"
              value={formData.soNguoiToiDa}
              onChange={(e) => setFormData({ ...formData, soNguoiToiDa: e.target.value })}
              margin="normal"
              required
              error={!!errors.soNguoiToiDa}
              helperText={errors.soNguoiToiDa}
              InputProps={{
                inputProps: { min: 1 }
              }}
            />
            <TextField
              fullWidth
              label="Mô tả"
              value={formData.moTa}
              onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
              margin="normal"
              multiline
              rows={3}
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
            ) : selectedLoaiPhong ? (
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

export default LoaiPhong;
