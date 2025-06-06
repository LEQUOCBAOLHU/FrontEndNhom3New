import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { phuThuService } from '../../services/phuThuService';

const PhuThu = () => {
  const [open, setOpen] = React.useState(false);
  const [phuThuList, setPhuThuList] = React.useState([]);
  const [selectedPhuThu, setSelectedPhuThu] = React.useState(null);
  const [formData, setFormData] = React.useState({
    tenPhuThu: '',
    giaTri: '',
    moTa: '',
  });
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchPhuThuList();
  }, []);

  const fetchPhuThuList = async () => {
    try {
      const data = await phuThuService.getAll();
      setPhuThuList(data);
    } catch (error) {
      showSnackbar('Lỗi khi tải danh sách phụ thu', 'error');
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPhuThu(null);
    setFormData({
      tenPhuThu: '',
      giaTri: '',
      moTa: '',
    });
  };

  const handleEdit = (phuThu) => {
    setSelectedPhuThu(phuThu);
    setFormData({
      tenPhuThu: phuThu.tenPhuThu,
      giaTri: phuThu.giaTri,
      moTa: phuThu.moTa,
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phụ thu này?')) {
      try {
        await phuThuService.delete(id);
        showSnackbar('Xóa phụ thu thành công', 'success');
        fetchPhuThuList();
      } catch (error) {
        showSnackbar('Lỗi khi xóa phụ thu', 'error');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedPhuThu) {
        await phuThuService.update(selectedPhuThu.id, formData);
        showSnackbar('Cập nhật phụ thu thành công', 'success');
      } else {
        await phuThuService.create(formData);
        showSnackbar('Thêm phụ thu thành công', 'success');
      }
      handleClose();
      fetchPhuThuList();
    } catch (error) {
      showSnackbar('Lỗi khi lưu phụ thu', 'error');
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Quản lý Phụ Thu
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Thêm Phụ Thu
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>Tên Phụ Thu</TableCell>
              <TableCell>Giá Trị</TableCell>
              <TableCell>Mô Tả</TableCell>
              <TableCell>Thao Tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {phuThuList.map((phuThu, index) => (
              <TableRow key={phuThu.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{phuThu.tenPhuThu}</TableCell>
                <TableCell>{phuThu.giaTri}</TableCell>
                <TableCell>{phuThu.moTa}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleEdit(phuThu)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(phuThu.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {selectedPhuThu ? 'Chỉnh Sửa Phụ Thu' : 'Thêm Phụ Thu Mới'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tên Phụ Thu"
            fullWidth
            value={formData.tenPhuThu}
            onChange={(e) => setFormData({ ...formData, tenPhuThu: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Giá Trị"
            type="number"
            fullWidth
            value={formData.giaTri}
            onChange={(e) => setFormData({ ...formData, giaTri: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Mô Tả"
            fullWidth
            multiline
            rows={4}
            value={formData.moTa}
            onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedPhuThu ? 'Cập Nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PhuThu; 