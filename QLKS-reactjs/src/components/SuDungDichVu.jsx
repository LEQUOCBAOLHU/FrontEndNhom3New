import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message } from 'antd';
import { apiFetch } from '../auth';
import './SuDungDichVu.css';

function SuDungDichVu() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('http://localhost:5189/api/SuDungDichVu');
      const resData = await res.json();
      setData(Array.isArray(resData) ? resData : (resData ? [resData] : []));
    } catch (e) {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (maSuDung) => {
    await apiFetch(`http://localhost:5189/api/SuDungDichVu/${maSuDung}`, { method: 'DELETE' });
    message.success('Xóa thành công!');
    fetchData();
  };

  const showEditModal = (record) => {
    setEditing(record);
    setIsModalVisible(true);
  };

  const showAddModal = () => {
    setEditing(null);
    setIsModalVisible(true);
  };

  const handleOk = async (values) => {
    if (editing) {
      await apiFetch(`http://localhost:5189/api/SuDungDichVu/${editing.maSuDung}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      message.success('Cập nhật thành công!');
    } else {
      await apiFetch('http://localhost:5189/api/SuDungDichVu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      message.success('Thêm thành công!');
    }
    setIsModalVisible(false);
    fetchData();
  };

  const columns = [
    { title: 'Mã sử dụng', dataIndex: 'maSuDung', key: 'maSuDung' },
    { title: 'Mã đặt phòng', dataIndex: 'maDatPhong', key: 'maDatPhong' },
    { title: 'Mã dịch vụ', dataIndex: 'maDichVu', key: 'maDichVu' },
    { title: 'Số lượng', dataIndex: 'soLuong', key: 'soLuong' },
    { title: 'Thành tiền', dataIndex: 'thanhTien', key: 'thanhTien' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button onClick={() => showEditModal(record)}>Sửa</Button>
          <Popconfirm title="Bạn chắc chắn xóa?" onConfirm={() => handleDelete(record.maSuDung)}>
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
        <Button onClick={fetchData}>Làm mới</Button>
      </Space>
      <Table columns={columns} dataSource={data} rowKey="maSuDung" loading={loading} />
      <Modal
        title={editing ? 'Sửa sử dụng dịch vụ' : 'Thêm sử dụng dịch vụ'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          layout="vertical"
          initialValues={editing || {}}
          onFinish={handleOk}
        >
          <Form.Item label="Mã đặt phòng" name="maDatPhong" rules={[{ required: true, message: 'Nhập mã đặt phòng!' }]}> <Input /> </Form.Item>
          <Form.Item label="Mã dịch vụ" name="maDichVu" rules={[{ required: true, message: 'Nhập mã dịch vụ!' }]}> <Input /> </Form.Item>
          <Form.Item label="Số lượng" name="soLuong" rules={[{ required: true, message: 'Nhập số lượng!' }]}> <Input type="number" /> </Form.Item>
          <Form.Item label="Thành tiền" name="thanhTien" rules={[{ required: true, message: 'Nhập thành tiền!' }]}> <Input type="number" /> </Form.Item>
          <Form.Item> <Button type="primary" htmlType="submit">Lưu</Button> </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default SuDungDichVu;
