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
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import './PhuThu.css';

const PhuThu = () => {
  const [phuThuList, setPhuThuList] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedPhuThu, setSelectedPhuThu] = useState(null);
  const [formData, setFormData] = useState({
    tenPhuThu: '',
    giaPhuThu: '',
    moTa: '',
  });

  useEffect(() => {
    fetchPhuThu();
  }, []);

  const fetchPhuThu = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/phuthu');
      setPhuThuList(response.data);
    } catch (error) {
      console.error('Error fetching phu thu:', error);
    }
  };

  const handleOpen = (phuThu = null) => {
    if (phuThu) {
      setSelectedPhuThu(phuThu);
      setFormData({
        tenPhuThu: phuThu.tenPhuThu,
        giaPhuThu: phuThu.giaPhuThu,
        moTa: phuThu.moTa,
      });
    } else {
      setSelectedPhuThu(null);
      setFormData({
        tenPhuThu: '',
        giaPhuThu: '',
        moTa: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPhuThu(null);
    setFormData({
      tenPhuThu: '',
      giaPhuThu: '',
      moTa: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedPhuThu) {
        await axios.put(`http://localhost:8080/api/phuthu/${selectedPhuThu.id}`, formData);
      } else {
        await axios.post('http://localhost:8080/api/phuthu', formData);
      }
      fetchPhuThu();
      handleClose();
    } catch (error) {
      console.error('Error saving phu thu:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phụ thu này?')) {
      try {
        await axios.delete(`http://localhost:8080/api/phuthu/${id}`);
        fetchPhuThu();
      } catch (error) {
        console.error('Error deleting phu thu:', error);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Quản lý Phụ thu
        </Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpen()}>
          Thêm phụ thu mới
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên phụ thu</TableCell>
              <TableCell>Giá phụ thu</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {phuThuList.map((phuThu) => (
              <TableRow key={phuThu.id}>
                <TableCell>{phuThu.tenPhuThu}</TableCell>
                <TableCell>{phuThu.giaPhuThu.toLocaleString('vi-VN')} VNĐ</TableCell>
                <TableCell>{phuThu.moTa}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(phuThu)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(phuThu.id)} color="error">
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
          {selectedPhuThu ? 'Chỉnh sửa phụ thu' : 'Thêm phụ thu mới'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Tên phụ thu"
              value={formData.tenPhuThu}
              onChange={(e) => setFormData({ ...formData, tenPhuThu: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Giá phụ thu"
              type="number"
              value={formData.giaPhuThu}
              onChange={(e) => setFormData({ ...formData, giaPhuThu: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Mô tả"
              value={formData.moTa}
              onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
              margin="normal"
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedPhuThu ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PhuThu; 