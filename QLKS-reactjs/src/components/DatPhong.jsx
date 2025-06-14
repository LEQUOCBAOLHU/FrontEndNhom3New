import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, DatePicker, Space, Popconfirm, message, Select, InputNumber, Spin } from 'antd';
import { apiFetch } from '../auth';
import dayjs from 'dayjs';
import './DatPhong.css';

function DatPhong() {
  const [datPhongs, setDatPhongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDatPhong, setEditingDatPhong] = useState(null);
  const [phongs, setPhongs] = useState([]);
  const [khachHangs, setKhachHangs] = useState([]);
  const [loadingPhong, setLoadingPhong] = useState(false);
  const [loadingKhachHang, setLoadingKhachHang] = useState(false);
  const [form] = Form.useForm();

  // Lấy danh sách đặt phòng
  const fetchDatPhongs = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('http://localhost:5189/api/DatPhong?pageNumber=1&pageSize=20');
      const data = await res.json();
      console.log('API Response (fetchDatPhongs):', JSON.stringify(data, null, 2));
      let list = [];
      if (data && data.data && Array.isArray(data.data.datPhongs)) {
        list = data.data.datPhongs;
      } else if (data && Array.isArray(data.datPhongs)) {
        list = data.datPhongs;
      } else if (data && Array.isArray(data.DatPhongs)) {
        list = data.DatPhongs;
      } else if (Array.isArray(data)) {
        list = data;
      }

      // Nếu API không trả về danhSachKhachHang, gọi API chi tiết cho từng đặt phòng
      const detailedList = await Promise.all(
        list.map(async (dp) => {
          if (!dp.danhSachKhachHang || dp.danhSachKhachHang.length === 0) {
            const detailRes = await apiFetch(`http://localhost:5189/api/DatPhong/${dp.maDatPhong}`);
            const detailData = await detailRes.json();
            return {
              ...dp,
              danhSachKhachHang: detailData.danhSachKhachHang || [], // Đảm bảo có danhSachKhachHang
            };
          }
          return dp;
        })
      );

      setDatPhongs(detailedList);
      if (detailedList.length === 0) message.warning('Không có dữ liệu đặt phòng!');
    } catch (e) {
      console.error('Error fetching datPhongs:', e);
      setDatPhongs([]);
      message.error('Không thể lấy dữ liệu đặt phòng!');
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách phòng
  const fetchPhongs = async () => {
    setLoadingPhong(true);
    try {
      const res = await apiFetch('http://localhost:5189/api/Phong?pageNumber=1&pageSize=100');
      const data = await res.json();
      console.log('API Response (fetchPhongs):', JSON.stringify(data, null, 2));
      let list = [];
      if (data && data.data && Array.isArray(data.data.phongs)) {
        list = data.data.phongs;
      } else if (data && Array.isArray(data.phongs)) {
        list = data.phongs;
      } else if (data && Array.isArray(data.Phongs)) {
        list = data.Phongs;
      } else if (Array.isArray(data)) {
        list = data;
      }
      setPhongs(list);
      if (list.length === 0) message.warning('Không có phòng nào trong hệ thống!');
    } catch (e) {
      console.error('Error fetching phongs:', e);
      setPhongs([]);
      message.error('Không thể lấy dữ liệu phòng!');
    } finally {
      setLoadingPhong(false);
    }
  };

  // Lấy danh sách khách hàng
  const fetchKhachHangs = async () => {
    setLoadingKhachHang(true);
    try {
      const res = await apiFetch('http://localhost:5189/api/KhachHang?pageNumber=1&pageSize=100');
      const data = await res.json();
      console.log('API Response (fetchKhachHangs):', JSON.stringify(data, null, 2));
      let list = [];
      if (data && data.data && Array.isArray(data.data.khachHangs)) {
        list = data.data.khachHangs;
      } else if (data && Array.isArray(data.khachHangs)) {
        list = data.khachHangs;
      } else if (data && Array.isArray(data.KhachHangs)) {
        list = data.KhachHangs;
      } else if (Array.isArray(data)) {
        list = data;
      }
      const filtered = list.filter(kh => !kh.trangThai || kh.trangThai.toLowerCase() !== 'vô hiệu hóa');
      setKhachHangs(filtered);
      if (filtered.length === 0) message.warning('Không có khách hàng nào trong hệ thống!');
    } catch (e) {
      console.error('Error fetching khachHangs:', e);
      setKhachHangs([]);
      message.error('Không thể lấy dữ liệu khách hàng!');
    } finally {
      setLoadingKhachHang(false);
    }
  };

  useEffect(() => {
    fetchDatPhongs();
    fetchPhongs();
    fetchKhachHangs();
  }, []);

  // Đồng bộ dữ liệu sau khi thực hiện thao tác
  const syncData = async () => {
    await Promise.all([fetchDatPhongs(), fetchPhongs(), fetchKhachHangs()]);
  };

  // Xử lý xóa đặt phòng
  const handleDelete = async (maDatPhong) => {
    try {
      const res = await apiFetch(`http://localhost:5189/api/DatPhong/${maDatPhong}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 403) {
          throw new Error('Bạn không có quyền xóa đặt phòng này. Vui lòng kiểm tra quyền truy cập.');
        }
        throw new Error(errorData.message || `Xóa đặt phòng ${maDatPhong} thất bại! Mã lỗi: ${res.status}`);
      }
      message.success(`Xóa đặt phòng ${maDatPhong} thành công!`);
      setDatPhongs(prev => prev.filter(item => item.maDatPhong !== maDatPhong));
      await syncData();
    } catch (e) {
      console.error('Error deleting datPhong:', e);
      message.error(`Lỗi: ${e.message}`);
    }
  };

  // Hiển thị modal thêm/sửa
  const showModal = async (record = null) => {
    setEditingDatPhong(record);
    setIsModalVisible(true);
    setTimeout(() => {
      if (record) {
        form.setFieldsValue({
          ...record,
          ngayNhanPhong: record.ngayNhanPhong ? dayjs(record.ngayNhanPhong) : null,
          ngayTraPhong: record.ngayTraPhong ? dayjs(record.ngayTraPhong) : null,
          maKhList: record.danhSachKhachHang ? record.danhSachKhachHang.map(kh => kh.maKh) : [],
          soNguoiO: record.soNguoiO || 1,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ soNguoiO: 1 });
      }
    }, 0);
  };

  // Xử lý thêm/sửa đặt phòng
  const handleOk = async (values) => {
    try {
      if (!values.maPhong) throw new Error('Vui lòng chọn phòng!');
      if (!values.maKh) throw new Error('Vui lòng chọn khách hàng đại diện!');
      if (!values.ngayNhanPhong || !values.ngayTraPhong) throw new Error('Vui lòng chọn đầy đủ ngày nhận và ngày trả phòng!');
      if (dayjs(values.ngayNhanPhong).isAfter(dayjs(values.ngayTraPhong), 'minute')) {
        throw new Error('Ngày nhận phòng phải trước hoặc bằng ngày trả phòng!');
      }
      if (!values.soNguoiO || values.soNguoiO < 1) throw new Error('Số người ở phải lớn hơn 0!');

      let maKhList = values.maKhList || [];
      if (!maKhList.includes(values.maKh)) {
        maKhList = [values.maKh, ...maKhList];
      }

      if (maKhList.length > values.soNguoiO) {
        message.warning(`Số lượng khách hàng (${maKhList.length}) vượt quá số người ở (${values.soNguoiO}). Vui lòng điều chỉnh!`);
        return;
      }

      const updatedValues = {
        ...values,
        maKhList: maKhList,
      };

      let newMaDatPhong = null;
      if (editingDatPhong) {
        const res = await apiFetch(`http://localhost:5189/api/DatPhong/${editingDatPhong.maDatPhong}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...updatedValues,
            maKhList: updatedValues.maKhList,
            ngayNhanPhong: dayjs(updatedValues.ngayNhanPhong).format('YYYY-MM-DD HH:mm'),
            ngayTraPhong: dayjs(updatedValues.ngayTraPhong).format('YYYY-MM-DD HH:mm'),
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Cập nhật thất bại');
        }
        message.success('Cập nhật thành công!');
      } else {
        const payload = {
          datPhong: {
            MaNv: null,
            MaKh: updatedValues.maKh ? Number(updatedValues.maKh) : null,
            MaPhong: updatedValues.maPhong ? String(updatedValues.maPhong) : null,
            NgayDat: dayjs().format('YYYY-MM-DD'),
            NgayNhanPhong: dayjs(updatedValues.ngayNhanPhong).toISOString(),
            NgayTraPhong: dayjs(updatedValues.ngayTraPhong).toISOString(),
            SoNguoiO: updatedValues.soNguoiO ? Number(updatedValues.soNguoiO) : 1,
            TrangThai: updatedValues.trangThai || 'Đã đặt'
          },
          maKhList: maKhList.map(Number),
          DatPhongVMs: [{
            MaKh: updatedValues.maKh ? Number(updatedValues.maKh) : null,
            MaPhong: updatedValues.maPhong ? String(updatedValues.maPhong) : null,
            NgayNhanPhong: dayjs(updatedValues.ngayNhanPhong).toISOString(),
            NgayTraPhong: dayjs(updatedValues.ngayTraPhong).toISOString(),
            SoNguoiO: updatedValues.soNguoiO ? Number(updatedValues.soNguoiO) : 1,
            TrangThai: updatedValues.trangThai || 'Đã đặt'
          }]
        };

        console.log('Payload gửi đi:', JSON.stringify(payload, null, 2));

        const res = await apiFetch('http://localhost:5189/api/DatPhong', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errorData = await res.json();
          console.error('API Error details:', {
            status: res.status,
            statusText: res.statusText,
            data: errorData
          });
          throw new Error(
            errorData.errors ? 
              Object.values(errorData.errors).flat().join(', ') : 
              errorData.message || errorData.title || 'Thêm mới thất bại'
          );
        }

        const responseData = await res.json();
        newMaDatPhong = responseData.maDatPhong;
        message.success('Thêm mới thành công!');
      }

      setIsModalVisible(false);
      setEditingDatPhong(null);
      form.resetFields();

      // Sau khi thêm mới, lấy thông tin chi tiết của đặt phòng vừa tạo
      if (newMaDatPhong) {
        const detailRes = await apiFetch(`http://localhost:5189/api/DatPhong/${newMaDatPhong}`);
        const newDatPhong = await detailRes.json();
        setDatPhongs(prev => [newDatPhong, ...prev.filter(dp => dp.maDatPhong !== newMaDatPhong)]);
      }

      await syncData();
    } catch (e) {
      console.error('Error in handleOk:', e);
      message.error(e.message || 'Có lỗi xảy ra!');
    }
  };

  const columns = [
    { title: 'Mã đặt phòng', dataIndex: 'maDatPhong', key: 'maDatPhong' },
    {
      title: 'Khách hàng',
      key: 'khachHang',
      render: (_, record) => {
        // Kiểm tra nếu danhSachKhachHang tồn tại và là mảng
        if (record.danhSachKhachHang && Array.isArray(record.danhSachKhachHang) && record.danhSachKhachHang.length > 0) {
          return record.danhSachKhachHang.map(kh => kh.hoTen || 'Không có tên').join(', ');
        }
        // Nếu không có danhSachKhachHang, hiển thị khách hàng đại diện (MaKh)
        if (record.maKh) {
          const khachHang = khachHangs.find(kh => kh.maKh === record.maKh);
          return khachHang ? khachHang.hoTen : 'Không xác định';
        }
        return 'Không có khách hàng';
      },
    },
    { title: 'Phòng', dataIndex: 'maPhong', key: 'maPhong' },
    { title: 'Ngày nhận', dataIndex: 'ngayNhanPhong', key: 'ngayNhanPhong' },
    { title: 'Ngày trả', dataIndex: 'ngayTraPhong', key: 'ngayTraPhong' },
    { title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai' },
    { title: 'Phụ thu', dataIndex: 'phuThu', key: 'phuThu', render: (value) => (value != null ? value : 0) },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button onClick={() => showModal(record)}>Sửa</Button>
          <Popconfirm title="Bạn chắc chắn xóa?" onConfirm={() => handleDelete(record.maDatPhong)}>
            <Button danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Quản lý đặt phòng</h2>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => showModal(null)}>
          Thêm đặt phòng
        </Button>
        <Button onClick={fetchDatPhongs}>Làm mới</Button>
      </Space>
      <Table columns={columns} dataSource={datPhongs} rowKey="maDatPhong" loading={loading} />
      <Modal
        title={editingDatPhong ? 'Sửa đặt phòng' : 'Thêm đặt phòng'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        destroyOnHidden
      >
        <Spin spinning={loadingPhong || loadingKhachHang}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleOk}
            onFinishFailed={({ errorFields }) => {
              if (errorFields && errorFields.length > 0) {
                message.error(errorFields[0].errors[0] || 'Vui lòng điền đầy đủ thông tin!');
              }
            }}
          >
            <Form.Item label="Mã phòng" name="maPhong" rules={[{ required: true, message: 'Chọn phòng!' }]}>
              <Select
                placeholder={phongs.length === 0 ? 'Không có phòng' : 'Chọn phòng'}
                loading={loadingPhong}
                showSearch
                optionFilterProp="children"
                allowClear
              >
                {phongs.map((phong) => (
                  <Select.Option key={phong.maPhong} value={phong.maPhong}>
                    {phong.tenPhong} ({phong.maPhong})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Khách hàng đại diện"
              name="maKh"
              rules={[{ required: true, message: 'Chọn khách hàng!' }]}
            >
              <Select
                placeholder="Chọn khách hàng"
                loading={loadingKhachHang}
                showSearch
                optionFilterProp="children"
                allowClear
              >
                {khachHangs.map((kh) => (
                  <Select.Option key={kh.maKh} value={kh.maKh}>
                    {kh.hoTen}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Ngày nhận phòng"
              name="ngayNhanPhong"
              rules={[{ required: true, message: 'Chọn ngày nhận!' }]}
            >
              <DatePicker style={{ width: '100%' }} showTime format="YYYY-MM-DD HH:mm" />
            </Form.Item>
            <Form.Item
              label="Ngày trả phòng"
              name="ngayTraPhong"
              rules={[{ required: true, message: 'Chọn ngày trả!' }]}
            >
              <DatePicker style={{ width: '100%' }} showTime format="YYYY-MM-DD HH:mm" />
            </Form.Item>
            <Form.Item
              label="Số người ở"
              name="soNguoiO"
              rules={[{ required: true, type: 'number', min: 1, message: 'Nhập số người ở (>=1)!' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} onChange={() => form.validateFields(['maKhList'])} />
            </Form.Item>
            <Form.Item
              label="Khách hàng (nhiều)"
              name="maKhList"
              extra="Chọn thêm khách hàng nếu có. Khách hàng đại diện sẽ tự động được thêm vào danh sách."
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const soNguoiO = getFieldValue('soNguoiO') || 1;
                    const maKh = getFieldValue('maKh');
                    const totalKhachHang = (value || []).length + (maKh ? 1 : 0);
                    if (totalKhachHang > soNguoiO) {
                      return Promise.reject(new Error(`Số lượng khách hàng không được vượt quá ${soNguoiO} người!`));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn thêm khách hàng (nếu có)"
                loading={loadingKhachHang}
                optionFilterProp="children"
                showSearch
                allowClear
              >
                {khachHangs.map((kh) => (
                  <Select.Option key={kh.maKh} value={kh.maKh}>
                    {kh.hoTen}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Trạng thái" name="trangThai">
              <Select placeholder="Chọn trạng thái">
                <Select.Option value="Đang sử dụng">Đang sử dụng</Select.Option>
                <Select.Option value="Hủy">Hủy</Select.Option>
                <Select.Option value="Hoàn thành">Hoàn thành</Select.Option>
                <Select.Option value="Đã đặt">Đã đặt</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" onClick={() => form.submit()}>
                {editingDatPhong ? 'Lưu' : 'Thêm đặt phòng'}
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
}

export default DatPhong;