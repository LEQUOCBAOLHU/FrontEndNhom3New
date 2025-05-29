import React, { useEffect, useState } from 'react';
import './LoaiPhong.css';
import { Button, Form, Input, Modal, Select } from 'antd';

const { Option } = Select;

const LoaiPhong = () => {
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5189/api/LoaiPhong/GetAll', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(res => Array.isArray(res) ? setData(res) : setData([]))
      .catch(console.error);
  }, []);

  const handleAddEdit = (values) => {
    console.log('Received values:', values);
    // Gọi API thêm/sửa loại phòng ở đây
    setIsModalVisible(false);
  };

  return (
    <div>
      <h2>Danh sách Loại phòng</h2>
      <Button type="primary" onClick={() => setIsModalVisible(true)}>
        Thêm loại phòng
      </Button>
      <table className="table-loaiphong">
        <thead>
          <tr>
            <th>Mã loại phòng</th>
            <th>Tên loại phòng</th>
            <th>Giá cơ bản</th>
            <th>Số người tối đa</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(data) && data.map(lp => (
            <tr key={lp.MaLoaiPhong}>
              <td>{lp.MaLoaiPhong}</td>
              <td>{lp.TenLoaiPhong}</td>
              <td>{lp.GiaCoBan}</td>
              <td>{lp.SoNguoiToiDa}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal thêm/sửa loại phòng */}
      <Modal
        title="Thêm/Sửa Loại Phòng"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleAddEdit}>
          <Form.Item label="Tên loại phòng" name="tenLoaiPhong">
            <Input placeholder="Nhập tên loại phòng" />
          </Form.Item>
          <Form.Item label="Số người tối đa" name="soNguoiToiDa">
            <Input placeholder="Nhập số người tối đa" type="number" />
          </Form.Item>
          <Form.Item label="Trạng thái" name="trangThai">
            <Select placeholder="Chọn trạng thái">
              <Option value="Đang kinh doanh">Đang kinh doanh</Option>
              <Option value="Ngừng kinh doanh">Ngừng kinh doanh</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Lưu</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LoaiPhong;
