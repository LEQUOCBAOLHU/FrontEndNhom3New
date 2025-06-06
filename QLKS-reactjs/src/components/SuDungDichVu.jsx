import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message, Select, DatePicker, InputNumber, Tooltip } from 'antd';
import { apiFetch } from '../auth';
import './SuDungDichVu.css';
import dayjs from 'dayjs';

function SuDungDichVu() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [datPhongs, setDatPhongs] = useState([]);
  const [dichVus, setDichVus] = useState([]);
  const [form] = Form.useForm();

  // Lấy tên dịch vụ từ mã dịch vụ
  const getTenDichVu = (maDichVu) => {
    const dv = dichVus.find(dv => dv.maDichVu === maDichVu);
    return dv ? dv.tenDichVu : maDichVu;
  };
  // Lấy đơn giá dịch vụ từ mã dịch vụ
  const getDonGiaDichVu = (maDichVu) => {
    const dv = dichVus.find(dv => dv.maDichVu === maDichVu);
    return dv ? dv.donGia : null;
  };
  // Lấy tên khách hàng từ mã đặt phòng
  const getTenKhachHang = (maDatPhong) => {
    const dp = datPhongs.find(dp => dp.maDatPhong === maDatPhong);
    return dp ? dp.tenKhachHang : maDatPhong;
  };

  // Đổi endpoint API Sử dụng dịch vụ sang API mới
  const SDDV_API = 'https://qlks-0dvh.onrender.com/api/SuDungDichVu';

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(SDDV_API);
      const resData = await res.json();
      if (resData.data?.suDungDichVus) {
        setData(resData.data.suDungDichVus);
      } else {
        setData([]);
        console.error('Unexpected response format:', resData);
      }
    } catch (e) {
      console.error('Error fetching data:', e);
      setData([]);
      message.error('Không thể tải dữ liệu sử dụng dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const fetchDatPhongs = async () => {
    try {
      const res = await apiFetch('https://qlks-0dvh.onrender.com/api/DatPhong?pageNumber=1&pageSize=100');
      const resData = await res.json();
      if (resData.data?.datPhongs) {
        setDatPhongs(resData.data.datPhongs);
      } else {
        setDatPhongs([]);
        console.error('Unexpected response format for bookings:', resData);
      }
    } catch (e) {
      console.error('Error fetching bookings:', e);
      setDatPhongs([]);
      message.error('Không thể tải danh sách đặt phòng');
    }
  };

  const fetchDichVus = async () => {
    try {
      const res = await apiFetch('https://qlks-0dvh.onrender.com/api/DichVu?pageNumber=1&pageSize=100');
      const resData = await res.json();
      if (resData.data?.dichVus) {
        setDichVus(resData.data.dichVus);
      } else {
        setDichVus([]);
        console.error('Unexpected response format for services:', resData);
      }
    } catch (e) {
      console.error('Error fetching services:', e);
      setDichVus([]);
      message.error('Không thể tải danh sách dịch vụ');
    }
  };

  // Đồng bộ dữ liệu khi vào trang hoặc sau khi thao tác
  const syncAll = async () => {
    await Promise.all([fetchData(), fetchDatPhongs(), fetchDichVus()]);
  };

  useEffect(() => {
    syncAll();
  }, []);

  const handleDelete = async (maSuDung) => {
    try {
      const res = await apiFetch(`${SDDV_API}/${maSuDung}`, { 
        method: 'DELETE' 
      });
      if (res.ok) {
        message.success('Xóa thành công!');
        syncAll();
      } else {
        const errorData = await res.json();
        message.error(errorData.message || 'Xóa thất bại!');
      }
    } catch (e) {
      console.error('Error deleting:', e);
      message.error('Xóa thất bại!');
    }
  };

  const showEditModal = (record) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      ngaySuDung: record.ngaySuDung ? dayjs(record.ngaySuDung) : undefined,
      ngayKetThuc: record.ngayKetThuc ? dayjs(record.ngayKetThuc) : undefined,
    });
    setIsModalVisible(true);
  };

  const showAddModal = () => {
    setEditing(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleOk = async (values) => {
    try {
      const payload = {
        ...values,
        soLuong: Number(values.soLuong),
        ngaySuDung: values.ngaySuDung ? values.ngaySuDung.format('YYYY-MM-DD') : undefined,
        ngayKetThuc: values.ngayKetThuc ? values.ngayKetThuc.format('YYYY-MM-DD') : undefined,
      };

      let res;
      if (editing) {
        res = await apiFetch(`${SDDV_API}/${editing.maSuDung}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await apiFetch(SDDV_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const resData = await res.json();
      if (res.ok) {
        message.success(editing ? 'Cập nhật thành công!' : 'Thêm thành công!');
        setIsModalVisible(false);
        syncAll();
      } else {
        message.error(resData.message || (editing ? 'Cập nhật thất bại!' : 'Thêm thất bại!'));
      }
    } catch (e) {
      console.error('Error submitting form:', e);
      message.error(editing ? 'Cập nhật thất bại!' : 'Thêm thất bại!');
    }
  };

  const columns = [
    { 
      title: 'Mã sử dụng', 
      dataIndex: 'maSuDung', 
      key: 'maSuDung',
      width: 100
    },
    { 
      title: 'Mã đặt phòng', 
      dataIndex: 'maDatPhong', 
      key: 'maDatPhong',
      width: 120
    },
    { 
      title: 'Tên khách hàng',
      dataIndex: 'maDatPhong',
      key: 'tenKhachHang',
      width: 180,
      render: (maDatPhong) => getTenKhachHang(maDatPhong)
    },
    { 
      title: 'Mã dịch vụ', 
      dataIndex: 'maDichVu', 
      key: 'maDichVu',
      width: 100
    },
    { 
      title: 'Tên dịch vụ', 
      dataIndex: 'maDichVu', 
      key: 'tenDichVu',
      width: 200,
      render: (maDichVu) => {
        const dv = dichVus.find(dv => dv.maDichVu === maDichVu);
        return dv ? (
          <Tooltip title={dv.moTa || ''}>{dv.tenDichVu}</Tooltip>
        ) : maDichVu;
      }
    },
    { 
      title: 'Đơn giá',
      dataIndex: 'maDichVu',
      key: 'donGia',
      width: 120,
      align: 'right',
      render: (maDichVu) => {
        const donGia = getDonGiaDichVu(maDichVu);
        return donGia ? `${donGia.toLocaleString('vi-VN')} VNĐ` : '-';
      }
    },
    { 
      title: 'Số lượng', 
      dataIndex: 'soLuong', 
      key: 'soLuong',
      width: 100,
      align: 'center'
    },
    { 
      title: 'Ngày sử dụng', 
      dataIndex: 'ngaySuDung', 
      key: 'ngaySuDung',
      width: 120,
      render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : '-'
    },
    { 
      title: 'Ngày kết thúc', 
      dataIndex: 'ngayKetThuc', 
      key: 'ngayKetThuc',
      width: 120,
      render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : '-'
    },
    { 
      title: 'Thành tiền', 
      dataIndex: 'thanhTien', 
      key: 'thanhTien',
      width: 150,
      render: (text) => text ? `${text.toLocaleString('vi-VN')} VNĐ` : '-',
      align: 'right'
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button onClick={() => showEditModal(record)}>Sửa</Button>
          <Popconfirm 
            title="Bạn chắc chắn xóa?" 
            onConfirm={() => handleDelete(record.maSuDung)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger>Xóa</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{padding: 24}}>
      <h2>Quản lý sử dụng dịch vụ</h2>
      <Space style={{marginBottom: 16}}>
        <Button type="primary" onClick={showAddModal}>Thêm sử dụng dịch vụ</Button>
        <Button onClick={syncAll}>Làm mới</Button>
      </Space>
      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="maSuDung" 
        loading={loading}
        pagination={{
          pageSize: 10,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`
        }}
        scroll={{ x: 1400 }}
      />
      <Modal
        title={editing ? 'Sửa sử dụng dịch vụ' : 'Thêm sử dụng dịch vụ'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleOk}
        >
          <Form.Item 
            label="Mã đặt phòng" 
            name="maDatPhong" 
            rules={[{ required: true, message: 'Chọn mã đặt phòng!' }]}
          > 
            <Select placeholder="Chọn mã đặt phòng">
              {datPhongs.map(dp => (
                <Select.Option key={dp.maDatPhong} value={dp.maDatPhong}>
                  {`#${dp.maDatPhong} - ${dp.tenKhachHang || ''}`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item 
            label="Mã dịch vụ" 
            name="maDichVu" 
            rules={[{ required: true, message: 'Chọn mã dịch vụ!' }]}
          > 
            <Select placeholder="Chọn mã dịch vụ">
              {dichVus.map(dv => (
                <Select.Option key={dv.maDichVu} value={dv.maDichVu}>
                  {`#${dv.maDichVu} - ${dv.tenDichVu} (${dv.donGia?.toLocaleString('vi-VN')} VNĐ)`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item 
            label="Số lượng" 
            name="soLuong" 
            rules={[{ required: true, message: 'Nhập số lượng!' }]}
          > 
            <InputNumber min={1} style={{width:'100%'}} /> 
          </Form.Item>
          <Form.Item 
            label="Ngày sử dụng" 
            name="ngaySuDung" 
            rules={[{ required: true, message: 'Chọn ngày sử dụng!' }]}
          > 
            <DatePicker format="DD/MM/YYYY" style={{width:'100%'}} /> 
          </Form.Item>
          <Form.Item 
            label="Ngày kết thúc" 
            name="ngayKetThuc"
          > 
            <DatePicker format="DD/MM/YYYY" style={{width:'100%'}} /> 
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editing ? 'Cập nhật' : 'Thêm mới'}
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default SuDungDichVu;
