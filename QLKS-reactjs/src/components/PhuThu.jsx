import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  Select,
  Space,
  Popconfirm,
  message,
  Typography,
} from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { apiFetch } from '../auth';
import './PhuThu.css';

const { Title } = Typography;
const { Option } = Select;

const PhuThu = () => {
  const [phuThus, setPhuThus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPhuThu, setEditingPhuThu] = useState(null);
  const [loaiPhongs, setLoaiPhongs] = useState([]);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchLoaiPhongs = async () => {
    try {
      const res = await apiFetch('http://localhost:5189/api/LoaiPhong?pageNumber=1&pageSize=100');
      const data = await res.json();
      if (data && data.data) {
        setLoaiPhongs(data.data.loaiPhongs || []);
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách loại phòng.');
    }
  };
  
  const fetchPhuThus = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const res = await apiFetch(`http://localhost:5189/api/PhuThu?pageNumber=${page}&pageSize=${pageSize}`);
      const data = await res.json();
      if (data && data.data) {
        setPhuThus(data.data.phuThus || []);
        setPagination({
          current: data.data.currentPage,
          pageSize: data.data.pageSize,
          total: data.data.totalItems,
        });
      } else {
        setPhuThus([]);
        message.error('Không thể tải dữ liệu phụ thu.');
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách phụ thu.');
      setPhuThus([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhuThus(pagination.current, pagination.pageSize);
    fetchLoaiPhongs();
  }, []);

  const handleTableChange = (newPagination) => {
    fetchPhuThus(newPagination.current, newPagination.pageSize);
  };

  const showModal = (record = null) => {
    setEditingPhuThu(record);
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingPhuThu(null);
    form.resetFields();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      let url = 'http://localhost:5189/api/PhuThu';
      let method = 'POST';

      if (editingPhuThu) {
        url = `http://localhost:5189/api/PhuThu/${editingPhuThu.maPhuThu}`;
        method = 'PUT';
      }

      const response = await apiFetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success(editingPhuThu ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
        handleCancel();
        fetchPhuThus(pagination.current, pagination.pageSize);
      } else {
        const errorData = await response.json().catch(() => ({}));
        message.error(errorData.message || 'Thao tác thất bại.');
      }
    } catch (error) {
        message.error('Đã xảy ra lỗi. Vui lòng thử lại.');
    }
  };

  const handleDelete = async (maPhuThu) => {
    try {
      const response = await apiFetch(`http://localhost:5189/api/PhuThu/${maPhuThu}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        message.success('Xóa phụ thu thành công!');
        fetchPhuThus(pagination.current, pagination.pageSize);
      } else {
        message.error('Xóa thất bại!');
      }
    } catch (error) {
      message.error('Đã xảy ra lỗi khi xóa.');
    }
  };

  const columns = [
    { title: 'Mã Phụ Thu', dataIndex: 'maPhuThu', key: 'maPhuThu' },
    { title: 'Loại Phòng', dataIndex: 'tenLoaiPhong', key: 'tenLoaiPhong' },
    {
      title: 'Giá Theo Ngày',
      dataIndex: 'giaPhuThuTheoNgay',
      key: 'giaPhuThuTheoNgay',
      render: (gia) => `${gia?.toLocaleString('vi-VN')} VNĐ`,
    },
    {
      title: 'Giá Theo Giờ',
      dataIndex: 'giaPhuThuTheoGio',
      key: 'giaPhuThuTheoGio',
      render: (gia) => `${gia?.toLocaleString('vi-VN')} VNĐ`,
    },
    {
      title: 'Thao Tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record.maPhuThu)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button icon={<DeleteOutlined />} danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Quản lý Phụ Thu</Title>
      <Table
        columns={columns}
        dataSource={phuThus}
        rowKey="maPhuThu"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        bordered
      />
      <Modal
        title={editingPhuThu ? 'Sửa Phụ Thu' : 'Thêm Phụ Thu'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        destroyOnClose
      >
        <Form form={form} layout="vertical" name="phuThuForm">
          <Form.Item
            name="maLoaiPhong"
            label="Loại Phòng"
            rules={[{ required: true, message: 'Vui lòng chọn loại phòng!' }]}
          >
            <Select placeholder="Chọn loại phòng" disabled={!!editingPhuThu}>
              {loaiPhongs.map(lp => (
                <Option key={lp.maLoaiPhong} value={lp.maLoaiPhong}>
                  {lp.tenLoaiPhong}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="giaPhuThuTheoNgay"
            label="Giá Phụ Thu Theo Ngày"
          >
            <InputNumber style={{ width: '100%' }} min={0} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
          </Form.Item>
          <Form.Item
            name="giaPhuThuTheoGio"
            label="Giá Phụ Thu Theo Giờ"
          >
            <InputNumber style={{ width: '100%' }} min={0} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PhuThu; 