import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Space,
  Popconfirm,
  message,
  Select,
  InputNumber,
} from 'antd';
import { apiFetch } from '../auth';
import './HoaDon.css';

function HoaDon() {
  const [hoaDons, setHoaDons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingHoaDon, setEditingHoaDon] = useState(null);
  const [search, setSearch] = useState('');
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedHoaDon, setSelectedHoaDon] = useState(null);
  const [isPhuThuModalVisible, setIsPhuThuModalVisible] = useState(false);
  const [phuThuList, setPhuThuList] = useState([]);
  const [editingPhuThu, setEditingPhuThu] = useState(null);
  const [isPhuThuFormVisible, setIsPhuThuFormVisible] = useState(false);
  const [selectedMaHoaDon, setSelectedMaHoaDon] = useState(null);

  const nhanVienId = localStorage.getItem('nhanVienId');

  // Fetch invoices
  const fetchHoaDons = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:5189/api/HoaDon?pageNumber=1&pageSize=10`;
      if (search) url = `http://localhost:5189/api/HoaDon/khach-hang/${encodeURIComponent(search)}`;
      const res = await apiFetch(url);
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.data?.hoaDons || data.hoaDons || data.HoaDons || []);
      setHoaDons(list);
    } catch (e) {
      setHoaDons([]);
      message.error('Không thể tải danh sách hóa đơn!');
    } finally {
      setLoading(false);
    }
  };

  // Fetch surcharges for a specific invoice
  const fetchPhuThu = async (maHoaDon) => {
    try {
      const res = await apiFetch(`http://localhost:5189/api/HoaDon/${maHoaDon}/phu-thu`);
      const data = await res.json();
      // Assuming the response contains an array of surcharges in chiTietHoaDons
      const phuThuData = data.chiTietHoaDons?.map((cthd, index) => ({
        key: `${maHoaDon}-${index}`,
        maDatPhong: cthd.maDatPhong,
        phuThu: cthd.phuThu || 0,
        lyDo: cthd.lyDo || 'N/A', // Optional reason field
      })) || [];
      setPhuThuList(phuThuData);
    } catch (e) {
      message.error('Không thể tải danh sách phụ thu!');
      setPhuThuList([]);
    }
  };

  useEffect(() => {
    fetchHoaDons();
  }, [search]);

  const handleDelete = async (maHoaDon) => {
    try {
      await apiFetch(`http://localhost:5189/api/HoaDon/${maHoaDon}`, { method: 'DELETE' });
      message.success('Xóa hóa đơn thành công!');
      fetchHoaDons();
    } catch (e) {
      message.error('Xóa hóa đơn thất bại!');
    }
  };

  const showEditModal = (record) => {
    setEditingHoaDon(record);
    setIsModalVisible(true);
  };

  const showAddModal = () => {
    setEditingHoaDon(null);
    setIsModalVisible(true);
  };

  const handleOk = async (values) => {
    let body = { ...values };
    try {
      if (editingHoaDon) {
        delete body.tongTien;
        await apiFetch(`http://localhost:5189/api/HoaDon/${editingHoaDon.maHoaDon}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        message.success('Cập nhật hóa đơn thành công!');
      } else {
        body.idNhanVien = nhanVienId;
        await apiFetch('http://localhost:5189/api/HoaDon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        message.success('Thêm hóa đơn thành công!');
      }
      setIsModalVisible(false);
      fetchHoaDons();
    } catch (e) {
      message.error('Lưu hóa đơn thất bại!');
    }
  };

  const handleUpdateStatus = async (values) => {
    if (!selectedHoaDon) return;
    try {
      await apiFetch(`http://localhost:5189/api/HoaDon/${selectedHoaDon.maHoaDon}/trang-thai`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trangThai: values.trangThai }),
      });
      message.success('Cập nhật trạng thái hóa đơn thành công!');
      setIsStatusModalVisible(false);
      fetchHoaDons();
    } catch (e) {
      message.error('Cập nhật trạng thái thất bại!');
    }
  };

  const handleUpdatePayment = async (values) => {
    if (!selectedHoaDon) return;
    try {
      await apiFetch(`http://localhost:5189/api/HoaDon/${selectedHoaDon.maHoaDon}/phuong-thuc-thanh-toan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phuongThucThanhToan: values.phuongThucThanhToan }),
      });
      message.success('Cập nhật phương thức thanh toán thành công!');
      setIsPaymentModalVisible(false);
      fetchHoaDons();
    } catch (e) {
      message.error('Cập nhật phương thức thanh toán thất bại!');
    }
  };

  const handleExportPDF = async (maHoaDon) => {
    try {
      const res = await apiFetch(`http://localhost:5189/api/HoaDon/${maHoaDon}/export-pdf`, {
        method: 'POST',
        responseType: 'blob',
      });
      if (!res.ok) throw new Error('Xuất PDF thất bại');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HoaDon_${maHoaDon}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      message.success('Xuất PDF thành công!');
    } catch (e) {
      message.error('Xuất PDF thất bại!');
    }
  };

  const handleExportPDFEmail = async (maHoaDon) => {
    try {
      const res = await apiFetch(`http://localhost:5189/api/HoaDon/${maHoaDon}/export-pdf/email`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Gửi email thất bại');
      message.success('Đã gửi hóa đơn PDF qua email!');
    } catch (e) {
      message.error('Gửi email thất bại!');
    }
  };

  // Surcharge management
  const showPhuThuModal = (record) => {
    setSelectedMaHoaDon(record.maHoaDon);
    setSelectedHoaDon(record);
    fetchPhuThu(record.maHoaDon);
    setIsPhuThuModalVisible(true);
  };

  const handleAddPhuThu = () => {
    setEditingPhuThu(null);
    setIsPhuThuFormVisible(true);
  };

  const handleEditPhuThu = (record) => {
    setEditingPhuThu(record);
    setIsPhuThuFormVisible(true);
  };

  const handleDeletePhuThu = async (key) => {
    try {
      await apiFetch(`http://localhost:5189/api/HoaDon/phu-thu/${key}`, {
        method: 'DELETE',
      });
      message.success('Xóa phụ thu thành công!');
      fetchPhuThu(selectedMaHoaDon);
    } catch (e) {
      message.error('Xóa phụ thu thất bại!');
    }
  };

  const handlePhuThuOk = async (values) => {
    try {
      if (editingPhuThu) {
        await apiFetch(`http://localhost:5189/api/HoaDon/phu-thu/${editingPhuThu.key}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...values, maHoaDon: selectedMaHoaDon }),
        });
        message.success('Cập nhật phụ thu thành công!');
      } else {
        await apiFetch(`http://localhost:5189/api/HoaDon/${selectedMaHoaDon}/phu-thu`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...values, maHoaDon: selectedMaHoaDon }),
        });
        message.success('Thêm phụ thu thành công!');
      }
      setIsPhuThuFormVisible(false);
      fetchPhuThu(selectedMaHoaDon);
    } catch (e) {
      message.error('Lưu phụ thu thất bại!');
    }
  };

  const columns = [
    { title: 'Mã hóa đơn', dataIndex: 'maHoaDon', key: 'maHoaDon' },
    { title: 'Khách hàng', dataIndex: 'tenKhachHang', key: 'tenKhachHang' },
    { title: 'Nhân viên', dataIndex: 'idNhanVien', key: 'idNhanVien' },
    { title: 'Ngày lập', dataIndex: 'ngayLap', key: 'ngayLap', render: (text) => (text ? new Date(text).toLocaleDateString('vi-VN') : 'N/A') },
    { title: 'Tổng tiền', dataIndex: 'tongTien', key: 'tongTien', render: (v) => (v ? v.toLocaleString('vi-VN') + ' đ' : 'Chưa tính') },
    { title: 'Phụ thu', dataIndex: 'phuThu', key: 'phuThu', render: (v) => (v ? v.toLocaleString('vi-VN') + ' đ' : '0 đ') },
    { title: 'Tiền theo giờ', dataIndex: 'tienTheoGio', key: 'tienTheoGio', render: (v) => (v ? v.toLocaleString('vi-VN') + ' đ' : '0 đ') },
    { title: 'Tiền theo ngày', dataIndex: 'tienTheoNgay', key: 'tienTheoNgay', render: (v) => (v ? v.toLocaleString('vi-VN') + ' đ' : '0 đ') },
    { title: 'Phương thức', dataIndex: 'phuongThucThanhToan', key: 'phuongThucThanhToan' },
    { title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button onClick={() => showEditModal(record)}>Sửa</Button>
          <Popconfirm title="Bạn chắc chắn xóa?" onConfirm={() => handleDelete(record.maHoaDon)}>
            <Button danger>Xóa</Button>
          </Popconfirm>
          <Button onClick={() => handleExportPDF(record.maHoaDon)}>Xuất PDF</Button>
          <Button onClick={() => handleExportPDFEmail(record.maHoaDon)}>Gửi PDF Email</Button>
          <Button onClick={() => { setSelectedHoaDon(record); setIsStatusModalVisible(true); }}>Cập nhật trạng thái</Button>
          <Button onClick={() => { setSelectedHoaDon(record); setIsPaymentModalVisible(true); }}>Cập nhật thanh toán</Button>
          <Button onClick={() => showPhuThuModal(record)}>Quản lý phụ thu</Button>
        </Space>
      ),
    },
  ];

  const phuThuColumns = [
    { title: 'Mã đặt phòng', dataIndex: 'maDatPhong', key: 'maDatPhong' },
    { title: 'Phụ thu (VNĐ)', dataIndex: 'phuThu', key: 'phuThu', render: (v) => v.toLocaleString('vi-VN') },
    { title: 'Lý do', dataIndex: 'lyDo', key: 'lyDo' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button onClick={() => handleEditPhuThu(record)}>Sửa</Button>
          <Popconfirm title="Bạn chắc chắn xóa?" onConfirm={() => handleDeletePhuThu(record.key)}>
            <Button danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Quản lý hóa đơn</h2>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search placeholder="Tìm kiếm theo tên khách hàng" onSearch={setSearch} allowClear />
        <Button type="primary" onClick={showAddModal}>Thêm hóa đơn</Button>
        <Button onClick={fetchHoaDons}>Làm mới</Button>
      </Space>
      <Table columns={columns} dataSource={hoaDons} rowKey="maHoaDon" loading={loading} />

      {/* Invoice Modal */}
      <Modal
        title={editingHoaDon ? 'Sửa hóa đơn' : 'Thêm hóa đơn'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" initialValues={editingHoaDon || {}} onFinish={handleOk}>
          <Form.Item
            label="Tên khách hàng"
            name="tenKhachHang"
            rules={[{ required: true, message: 'Nhập tên khách hàng!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Tên nhân viên"
            name="tenNhanVien"
            rules={[{ required: true, message: 'Nhập tên nhân viên!' }]}
          >
            <Input disabled={!!nhanVienId} defaultValue={nhanVienId ? 'Current User' : ''} />
          </Form.Item>
          <Form.Item
            label="Ngày lập"
            name="ngayLap"
            rules={[{ required: true, message: 'Chọn ngày lập!' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item
            label="Tổng tiền"
            name="tongTien"
            rules={[{ required: !editingHoaDon, message: 'Nhập tổng tiền!' }]}
          >
            <InputNumber style={{ width: '100%' }} disabled={editingHoaDon} />
          </Form.Item>
          <Form.Item
            label="Phương thức thanh toán"
            name="phuongThucThanhToan"
            rules={[{ required: true, message: 'Chọn phương thức!' }]}
          >
            <Select>
              <Select.Option value="Tiền mặt">Tiền mặt</Select.Option>
              <Select.Option value="Chuyển khoản">Chuyển khoản</Select.Option>
              <Select.Option value="Thẻ tín dụng">Thẻ tín dụng</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Trạng thái"
            name="trangThai"
            rules={[{ required: true, message: 'Chọn trạng thái!' }]}
          >
            <Select>
              <Select.Option value="Chưa thanh toán">Chưa thanh toán</Select.Option>
              <Select.Option value="Đã thanh toán trước">Đã thanh toán trước</Select.Option>
              <Select.Option value="Đã thanh toán">Đã thanh toán</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Lưu
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        title="Cập nhật trạng thái hóa đơn"
        open={isStatusModalVisible}
        onCancel={() => setIsStatusModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" onFinish={handleUpdateStatus}>
          <Form.Item
            label="Trạng thái"
            name="trangThai"
            rules={[{ required: true, message: 'Chọn trạng thái!' }]}
          >
            <Select>
              <Select.Option value="Chưa thanh toán">Chưa thanh toán</Select.Option>
              <Select.Option value="Đã thanh toán trước">Đã thanh toán trước</Select.Option>
              <Select.Option value="Đã thanh toán">Đã thanh toán</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Payment Method Update Modal */}
      <Modal
        title="Cập nhật phương thức thanh toán"
        open={isPaymentModalVisible}
        onCancel={() => setIsPaymentModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" onFinish={handleUpdatePayment}>
          <Form.Item
            label="Phương thức thanh toán"
            name="phuongThucThanhToan"
            rules={[{ required: true, message: 'Chọn phương thức!' }]}
          >
            <Select>
              <Select.Option value="Tiền mặt">Tiền mặt</Select.Option>
              <Select.Option value="Chuyển khoản">Chuyển khoản</Select.Option>
              <Select.Option value="Thẻ tín dụng">Thẻ tín dụng</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Surcharge Management Modal */}
      <Modal
        title="Quản lý phụ thu"
        open={isPhuThuModalVisible}
        onCancel={() => setIsPhuThuModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Button type="primary" onClick={handleAddPhuThu} style={{ marginBottom: 16 }}>
          Thêm phụ thu
        </Button>
        <Table columns={phuThuColumns} dataSource={phuThuList} rowKey="key" loading={loading} />
        <Modal
          title={editingPhuThu ? 'Sửa phụ thu' : 'Thêm phụ thu'}
          open={isPhuThuFormVisible}
          onCancel={() => setIsPhuThuFormVisible(false)}
          footer={null}
          destroyOnClose
        >
          <Form layout="vertical" initialValues={editingPhuThu || {}} onFinish={handlePhuThuOk}>
            <Form.Item
              label="Mã đặt phòng"
              name="maDatPhong"
              rules={[{ required: true, message: 'Nhập mã đặt phòng!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Phụ thu (VNĐ)"
              name="phuThu"
              rules={[{ required: true, message: 'Nhập số tiền phụ thu!' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item label="Lý do" name="lyDo">
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Lưu
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Modal>
    </div>
  );
}

export default HoaDon;