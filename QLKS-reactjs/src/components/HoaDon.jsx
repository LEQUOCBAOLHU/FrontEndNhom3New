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

  const handleDelete = async (maHoaDon) => {
    try {
      await apiFetch(`${API_BASE_URL}/api/HoaDon/${maHoaDon}`, { method: 'DELETE' });
      message.success('Xóa hóa đơn thành công!');
      fetchHoaDons();
    } catch (e) {
      message.error('Xóa hóa đơn thất bại!');
    }
  };

  const showAddModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async (values) => {
    try {
      const formattedData = {
        ...values,
        ngayLap: values.ngayLap?.format('YYYY-MM-DD'),
      };

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
        method: 'GET',
        headers: {
          'Accept': 'application/pdf'
        }
      });

      if (!res.ok) {
        throw new Error('Không thể xuất PDF!');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HoaDon_${maHoaDon}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      message.success('Xuất PDF thành công!');
    } catch (e) {
      message.error('Xuất PDF thất bại!');
    }
  };

  const handleExportPDFEmail = async (maHoaDon) => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/HoaDon/${maHoaDon}/export-pdf-email`, {
        method: 'POST'
      });

      if (!res.ok) {
        throw new Error('Không thể gửi email!');
      }

      message.success('Gửi email thành công!');
    } catch (e) {
      message.error('Gửi email thất bại!');
    }
  };

  const showPhuThuModal = (record) => {
    setSelectedMaHoaDon(record.maHoaDon);
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
      const [maHoaDon, index] = key.split('-');
      await apiFetch(`${API_BASE_URL}/api/HoaDon/${maHoaDon}/phu-thu/${index}`, {
        method: 'DELETE'
      });
      message.success('Xóa phụ thu thành công!');
      fetchPhuThu(maHoaDon);
    } catch (e) {
      message.error('Xóa phụ thu thất bại!');
    }
  };

  const handlePhuThuOk = async (values) => {
    if (!selectedMaHoaDon) return;
    try {
      const data = {
        maDatPhong: values.maDatPhong,
        phuThu: values.phuThu,
        lyDo: values.lyDo
      };

      if (editingPhuThu) {
        await apiFetch(`${API_BASE_URL}/api/HoaDon/${selectedMaHoaDon}/phu-thu/${editingPhuThu.key.split('-')[1]}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        message.success('Cập nhật phụ thu thành công!');
      } else {
        await apiFetch(`${API_BASE_URL}/api/HoaDon/${selectedMaHoaDon}/phu-thu`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        message.success('Thêm phụ thu thành công!');
      }
      setIsPhuThuFormVisible(false);
      fetchPhuThu(selectedMaHoaDon);
    } catch (e) {
      message.error(editingPhuThu ? 'Cập nhật phụ thu thất bại!' : 'Thêm phụ thu thất bại!');
    }
  };

  const columns = [
    {
      title: 'Mã Hóa Đơn',
      dataIndex: 'maHoaDon',
      key: 'maHoaDon',
    },
    {
      title: 'Tên Khách Hàng',
      dataIndex: 'tenKhachHang',
      key: 'tenKhachHang',
    },
    {
      title: 'Ngày Lập',
      dataIndex: 'ngayLap',
      key: 'ngayLap',
      render: (text) => moment(text).format('DD/MM/YYYY'),
    },
    {
      title: 'Phương Thức Thanh Toán',
      dataIndex: 'phuongThucThanhToan',
      key: 'phuongThucThanhToan',
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
    },
    {
      title: 'Thao Tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa hóa đơn này?"
            onConfirm={() => handleDelete(record.maHoaDon)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary" danger>
              Xóa
            </Button>
          </Popconfirm>
          <Button onClick={() => handleExportPDF(record.maHoaDon)}>
            Xuất PDF
          </Button>
          <Button onClick={() => handleExportPDFEmail(record.maHoaDon)}>
            Gửi Email
          </Button>
          <Button onClick={() => {
            setSelectedHoaDon(record);
            setIsStatusModalVisible(true);
          }}>
            Cập Nhật Trạng Thái
          </Button>
          <Button onClick={() => {
            setSelectedHoaDon(record);
            setIsPaymentModalVisible(true);
          }}>
            Cập Nhật Thanh Toán
          </Button>
          <Button onClick={() => showPhuThuModal(record)}>
            Phụ Thu
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="hoa-don-container">
      <div className="hoa-don-header">
        <h2>Quản lý hóa đơn</h2>
        <Space>
          <Input.Search
            placeholder="Tìm kiếm theo tên khách hàng"
            onSearch={value => setSearch(value)}
            style={{ width: 300 }}
          />
          <Button type="primary" onClick={showAddModal}>
            Thêm hóa đơn
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={hoaDons}
        rowKey="maHoaDon"
        loading={loading}
        pagination={{
          total: hoaDons.length,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Tổng số ${total} hóa đơn`
        }}
      />

      {/* Add Invoice Modal */}
      <Modal
        title="Thêm hóa đơn"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          layout="vertical"
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
              Thêm mới
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        title="Cập nhật trạng thái"
        open={isStatusModalVisible}
        onCancel={() => setIsStatusModalVisible(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={handleUpdateStatus}
          initialValues={{ trangThai: selectedHoaDon?.trangThai }}
        >
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
      >
        <Form
          layout="vertical"
          onFinish={handleUpdatePayment}
          initialValues={{ phuongThucThanhToan: selectedHoaDon?.phuongThucThanhToan }}
        >
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
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Surcharge Modal */}
      <Modal
        title="Quản lý phụ thu"
        open={isPhuThuModalVisible}
        onCancel={() => setIsPhuThuModalVisible(false)}
        footer={null}
        width={800}
      >
        <Button type="primary" onClick={handleAddPhuThu} style={{ marginBottom: 16 }}>
          Thêm phụ thu
        </Button>
        <Table
          columns={[
            {
              title: 'Mã đặt phòng',
              dataIndex: 'maDatPhong',
              key: 'maDatPhong',
            },
            {
              title: 'Phụ thu',
              dataIndex: 'phuThu',
              key: 'phuThu',
              render: (value) => `${value.toLocaleString('vi-VN')} đ`,
            },
            {
              title: 'Lý do',
              dataIndex: 'lyDo',
              key: 'lyDo',
            },
            {
              title: 'Thao tác',
              key: 'action',
              render: (_, record) => (
                <Space>
                  <Button onClick={() => handleEditPhuThu(record)}>Sửa</Button>
                  <Popconfirm
                    title="Bạn có chắc muốn xóa phụ thu này?"
                    onConfirm={() => handleDeletePhuThu(record.key)}
                    okText="Có"
                    cancelText="Không"
                  >
                    <Button danger>Xóa</Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          dataSource={phuThuList}
          rowKey="key"
        />
      </Modal>

      {/* Surcharge Form Modal */}
      <Modal
        title={editingPhuThu ? 'Sửa phụ thu' : 'Thêm phụ thu'}
        open={isPhuThuFormVisible}
        onCancel={() => setIsPhuThuFormVisible(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={handlePhuThuOk}
          initialValues={editingPhuThu}
        >
          <Form.Item
            label="Mã đặt phòng"
            name="maDatPhong"
            rules={[{ required: true, message: 'Vui lòng nhập mã đặt phòng!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Phụ thu"
            name="phuThu"
            rules={[{ required: true, message: 'Vui lòng nhập phụ thu!' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
          <Form.Item
            label="Lý do"
            name="lyDo"
            rules={[{ required: true, message: 'Vui lòng nhập lý do!' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingPhuThu ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default HoaDon;