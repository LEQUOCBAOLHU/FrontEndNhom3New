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
  Descriptions,
  Typography,
  Divider,
} from 'antd';
import { apiFetch } from '../auth';
import './HoaDon.css';
import moment from 'moment';

const API_BASE_URL = 'https://localhost:7274';

function HoaDon() {
  const [hoaDons, setHoaDons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingHoaDon, setEditingHoaDon] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [chiTietHoaDon, setChiTietHoaDon] = useState(null);
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
      let url = `${API_BASE_URL}/api/HoaDon?pageNumber=1&pageSize=10`;
      if (search) url = `${API_BASE_URL}/api/HoaDon/khach-hang/${encodeURIComponent(search)}`;
      
      const res = await apiFetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Lỗi khi tải danh sách hóa đơn: ${res.status}`);
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.data?.hoaDons || data.hoaDons || data.HoaDons || []);
      setHoaDons(list);
    } catch (e) {
      console.error('Error fetching invoices:', e);
      setHoaDons([]);
      message.error(e.message || 'Không thể tải danh sách hóa đơn!');
    } finally {
      setLoading(false);
    }
  };

  // Fetch surcharges for a specific invoice
  const fetchPhuThu = async (maHoaDon) => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/HoaDon/${maHoaDon}/phu-thu`);
      const data = await res.json();
      const phuThuData = data.chiTietHoaDons?.map((cthd, index) => ({
        key: `${maHoaDon}-${index}`,
        maDatPhong: cthd.maDatPhong,
        phuThu: cthd.phuThu || 0,
        lyDo: cthd.lyDo || 'N/A',
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

  const showDetailModal = async (maHoaDon) => {
    setLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/HoaDon/${maHoaDon}`);
      const data = await res.json();
      if(data.data) {
        setChiTietHoaDon(data.data);
        setIsDetailModalVisible(true);
      } else {
        message.error('Không thể tải chi tiết hóa đơn!');
      }
    } catch (error) {
      message.error('Lỗi khi tải chi tiết hóa đơn!');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (maHoaDon) => {
    try {
      await apiFetch(`${API_BASE_URL}/api/HoaDon/${maHoaDon}`, { method: 'DELETE' });
      message.success('Xóa hóa đơn thành công!');
      fetchHoaDons();
    } catch (e) {
      message.error('Xóa hóa đơn thất bại!');
    }
  };

  const showEditModal = (record) => {
    // Format dữ liệu trước khi set vào form
    const formattedData = {
      ...record,
      ngayLap: record.ngayLap ? moment(record.ngayLap) : null,
    };
    setEditingHoaDon(formattedData);
    setIsModalVisible(true);
  };

  const showAddModal = () => {
    setEditingHoaDon(null);
    setIsModalVisible(true);
  };

  const handleOk = async (values) => {
    try {
      const formattedData = {
        ...values,
        ngayLap: values.ngayLap?.format('YYYY-MM-DD'),
      };

      if (editingHoaDon) {
        // Chuẩn hóa trạng thái
        let trangThai = formattedData.trangThai;
        if (trangThai === 'Chua thanh toán') {
          trangThai = 'Chưa thanh toán';
        }

        const updateData = {
          tenKhachHang: formattedData.tenKhachHang,
          ngayLap: formattedData.ngayLap,
          phuongThucThanhToan: formattedData.phuongThucThanhToan,
          trangThai: trangThai
        };

        console.log('Sending update data:', updateData);

        const response = await apiFetch(`${API_BASE_URL}/api/HoaDon/${editingHoaDon.maHoaDon}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API Error:', errorData);
          throw new Error(errorData.message || `Lỗi khi cập nhật hóa đơn: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('Update response:', responseData);

        message.success('Cập nhật hóa đơn thành công!');
        setIsModalVisible(false);
        fetchHoaDons();
      } else {
        // Khi thêm mới
        formattedData.idNhanVien = nhanVienId;
        console.log('Sending new invoice data:', formattedData);

        const response = await apiFetch(`${API_BASE_URL}/api/HoaDon`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(formattedData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API Error:', errorData);
          throw new Error(errorData.message || `Lỗi khi thêm hóa đơn: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('Create response:', responseData);

        message.success('Thêm hóa đơn thành công!');
        setIsModalVisible(false);
        fetchHoaDons();
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      message.error(error.message || 'Lưu hóa đơn thất bại!');
    }
  };

  const handleUpdateStatus = async (values) => {
    if (!selectedHoaDon) return;
    try {
      await apiFetch(`${API_BASE_URL}/api/HoaDon/${selectedHoaDon.maHoaDon}/trang-thai`, {
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
      await apiFetch(`${API_BASE_URL}/api/HoaDon/${selectedHoaDon.maHoaDon}/phuong-thuc-thanh-toan`, {
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
      const res = await apiFetch(`${API_BASE_URL}/api/HoaDon/${maHoaDon}/export-pdf`, {
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
      const res = await apiFetch(`${API_BASE_URL}/api/HoaDon/${maHoaDon}/export-pdf/email`, {
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
      await apiFetch(`${API_BASE_URL}/api/HoaDon/phu-thu/${key}`, {
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
        await apiFetch(`${API_BASE_URL}/api/HoaDon/phu-thu/${editingPhuThu.key}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...values, maHoaDon: selectedMaHoaDon }),
        });
        message.success('Cập nhật phụ thu thành công!');
      } else {
        await apiFetch(`${API_BASE_URL}/api/HoaDon/${selectedMaHoaDon}/phu-thu`, {
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
    { 
      title: 'Nhân viên', 
      dataIndex: 'tenNhanVien', 
      key: 'tenNhanVien',
      render: (text, record) => text || record.idNhanVien || 'N/A'
    },
    { title: 'Ngày lập', dataIndex: 'ngayLap', key: 'ngayLap', render: (text) => (text ? new Date(text).toLocaleDateString('vi-VN') : 'N/A') },
    { title: 'Tổng tiền', dataIndex: 'tongTien', key: 'tongTien', render: (v) => (v ? v.toLocaleString('vi-VN') + ' đ' : 'Chưa tính') },
    { title: 'Phụ thu', dataIndex: 'phuThu', key: 'phuThu', render: (v) => (v ? v.toLocaleString('vi-VN') + ' đ' : '0 đ') },
    { title: 'Tiền theo giờ', dataIndex: 'tienTheoGio', key: 'tienTheoGio', render: (v) => (v ? v.toLocaleString('vi-VN') + ' đ' : '0 đ') },
    { title: 'Tiền theo ngày', dataIndex: 'tienTheoNgay', key: 'tienTheoNgay', render: (v) => (v ? v.toLocaleString('vi-VN') + ' đ' : '0 đ') },
    { title: 'Phương thức', dataIndex: 'phuongThucThanhToan', key: 'phuongThucThanhToan' },
    { title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai' },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button onClick={() => showDetailModal(record.maHoaDon)}>Chi tiết</Button>
          <Button onClick={() => showEditModal(record)}>Sửa</Button>
          <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDelete(record.maHoaDon)}>
            <Button danger>Xóa</Button>
          </Popconfirm>
          <Button onClick={() => handleExportPDF(record.maHoaDon)}>Xuất PDF</Button>
          <Button onClick={() => handleExportPDFEmail(record.maHoaDon)}>Gửi Email</Button>
          <Button onClick={() => showPhuThuModal(record)}>Quản lý phụ thu</Button>
          <Button onClick={() => { setSelectedHoaDon(record); setIsStatusModalVisible(true); }}>Cập nhật TT</Button>
          <Button onClick={() => { setSelectedHoaDon(record); setIsPaymentModalVisible(true); }}>Cập nhật PTTT</Button>
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

      <Modal
        title="Chi tiết hóa đơn"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {chiTietHoaDon && (
          <div>
            <Descriptions title="Thông tin chung" bordered column={2}>
              <Descriptions.Item label="Mã hóa đơn">{chiTietHoaDon.maHoaDon}</Descriptions.Item>
              <Descriptions.Item label="Tên khách hàng">{chiTietHoaDon.tenKhachHang}</Descriptions.Item>
              <Descriptions.Item label="Nhân viên lập">{chiTietHoaDon.tenNhanVien}</Descriptions.Item>
              <Descriptions.Item label="Ngày lập">{new Date(chiTietHoaDon.ngayLap).toLocaleDateString('vi-VN')}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">{chiTietHoaDon.trangThai}</Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">{chiTietHoaDon.phuongThucThanhToan}</Descriptions.Item>
            </Descriptions>

            <Divider />
            
            <Typography.Title level={5}>Chi tiết dịch vụ</Typography.Title>
            <Table
              dataSource={chiTietHoaDon.chiTietDichVu}
              columns={[
                { title: 'Tên dịch vụ', dataIndex: 'tenDichVu', key: 'tenDichVu' },
                { title: 'Số lượng', dataIndex: 'soLuong', key: 'soLuong' },
                { title: 'Đơn giá', dataIndex: 'donGia', key: 'donGia', render: v => v.toLocaleString('vi-VN') + ' đ' },
                { title: 'Thành tiền', dataIndex: 'thanhTien', key: 'thanhTien', render: v => v.toLocaleString('vi-VN') + ' đ' },
              ]}
              pagination={false}
              rowKey="tenDichVu"
            />
            
            <Divider />

            <Descriptions bordered column={1}>
              <Descriptions.Item label="Tiền phòng">{chiTietHoaDon.tongTienPhong?.toLocaleString('vi-VN')} đ</Descriptions.Item>
              <Descriptions.Item label="Tiền dịch vụ">{chiTietHoaDon.tongTienDichVu?.toLocaleString('vi-VN')} đ</Descriptions.Item>
              <Descriptions.Item label="Phụ thu">{chiTietHoaDon.tongPhuThu?.toLocaleString('vi-VN')} đ</Descriptions.Item>
              <Descriptions.Item label="Tổng cộng">
                <Typography.Text strong style={{fontSize: 18}}>
                  {chiTietHoaDon.tongTien?.toLocaleString('vi-VN')} đ
                </Typography.Text>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* Invoice Modal */}
      <Modal
        title={editingHoaDon ? 'Sửa hóa đơn' : 'Thêm hóa đơn'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnHidden
      >
        <Form 
          layout="vertical" 
          initialValues={editingHoaDon ? {
            ...editingHoaDon,
            ngayLap: editingHoaDon.ngayLap ? moment(editingHoaDon.ngayLap) : null,
          } : {}} 
          onFinish={handleOk}
        >
          <Form.Item
            label="Tên khách hàng"
            name="tenKhachHang"
            rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Nhân viên"
            name="tenNhanVien"
          >
            <Input 
              disabled={true} 
              value={editingHoaDon?.tenNhanVien || 'Current User'} 
            />
          </Form.Item>
          <Form.Item
            label="Ngày lập"
            name="ngayLap"
            rules={[{ required: true, message: 'Vui lòng chọn ngày lập!' }]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              format="DD/MM/YYYY"
              disabledDate={(current) => current && current > moment().endOf('day')}
            />
          </Form.Item>
          <Form.Item
            label="Tổng tiền"
            name="tongTien"
            rules={[{ required: !editingHoaDon, message: 'Nhập tổng tiền!' }]}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              disabled={editingHoaDon}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
          <Form.Item
            label="Phương thức thanh toán"
            name="phuongThucThanhToan"
            rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán!' }]}
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
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select>
              <Select.Option value="Chưa thanh toán">Chưa thanh toán</Select.Option>
              <Select.Option value="Đã thanh toán trước">Đã thanh toán trước</Select.Option>
              <Select.Option value="Đã thanh toán">Đã thanh toán</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingHoaDon ? 'Cập nhật' : 'Thêm mới'}
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
        destroyOnHidden
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
        destroyOnHidden
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
        destroyOnHidden
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
          destroyOnHidden
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