import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message, Space, Tag, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';

// Thêm interceptor cho axios để tự động đính kèm token
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

const LoaiPhong = () => {
    const [loaiPhongs, setLoaiPhongs] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [phongs, setPhongs] = useState([]);
    const [selectedLoaiPhong, setSelectedLoaiPhong] = useState(null);

    const fetchLoaiPhongs = async (page = 1, pageSize = 10) => {
        try {
            setLoading(true);
            let url = `http://localhost:5189/api/LoaiPhong?pageNumber=${page}&pageSize=${pageSize}`;
            const response = await axios.get(url);
            let dataArr = [];
            let paginationData = {};
            if (response.data.data) {
                if (Array.isArray(response.data.data.loaiPhongs)) {
                    dataArr = response.data.data.loaiPhongs;
                    paginationData = {
                        current: response.data.data.currentPage,
                        pageSize: response.data.data.pageSize,
                        total: response.data.data.totalItems
                    };
                } else if (Array.isArray(response.data.data)) {
                    dataArr = response.data.data;
                    paginationData = {
                        current: 1,
                        pageSize: dataArr.length,
                        total: dataArr.length
                    };
                }
            } else if (Array.isArray(response.data)) {
                dataArr = response.data;
                paginationData = {
                    current: 1,
                    pageSize: dataArr.length,
                    total: dataArr.length
                };
            }
            setLoaiPhongs(dataArr);
            setPagination(paginationData);
        } catch (error) {
            message.error('Lỗi khi tải danh sách loại phòng');
            console.error('Error fetching loai phong:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPhongs = async () => {
        try {
            const response = await axios.get('http://localhost:5189/api/Phong?pageNumber=1&pageSize=1000');
            let phongArr = [];
            if (response.data.data) {
                if (Array.isArray(response.data.data.phongs)) {
                    phongArr = response.data.data.phongs;
                } else if (Array.isArray(response.data.data)) {
                    phongArr = response.data.data;
                }
            } else if (Array.isArray(response.data)) {
                phongArr = response.data;
            }
            setPhongs(phongArr);
        } catch (error) {
            // Không cần báo lỗi nếu không lấy được phòng
        }
    };

    useEffect(() => {
        fetchLoaiPhongs();
        fetchPhongs();
    }, []);

    const handleTableChange = (pagination) => {
        fetchLoaiPhongs(pagination.current, pagination.pageSize);
    };

    const showModal = (record = null) => {
        if (record) {
            form.setFieldsValue({
                tenLoaiPhong: record.tenLoaiPhong,
                giaCoBan: record.giaCoBan,
                soNguoiToiDa: record.soNguoiToiDa
            });
            setEditingId(record.maLoaiPhong);
        } else {
            form.resetFields();
            setEditingId(null);
        }
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setEditingId(null);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingId) {
                // Cập nhật loại phòng
                await axios.put(`http://localhost:5189/api/LoaiPhong/${editingId}`, values);
                message.success('Cập nhật loại phòng thành công');
            } else {
                // Thêm loại phòng mới
                await axios.post('http://localhost:5189/api/LoaiPhong', values);
                message.success('Thêm loại phòng thành công');
            }
            setIsModalVisible(false);
            form.resetFields();
            fetchLoaiPhongs(pagination.current, pagination.pageSize);
        } catch (error) {
            if (error.response?.data?.message) {
                message.error(error.response.data.message);
            } else {
                message.error('Có lỗi xảy ra');
            }
            console.error('Error submitting form:', error);
        }
    };

    const handleDelete = async (maLoaiPhong) => {
        try {
            await axios.delete(`http://localhost:5189/api/LoaiPhong/${maLoaiPhong}`);
            message.success('Xóa loại phòng thành công');
            fetchLoaiPhongs(pagination.current, pagination.pageSize);
        } catch (error) {
            if (error.response?.data?.message) {
                message.error(error.response.data.message);
            } else {
                message.error('Có lỗi xảy ra khi xóa loại phòng');
            }
            console.error('Error deleting loai phong:', error);
        }
    };

    const getSoLuongPhong = (maLoaiPhong) => {
        return phongs.filter(p => p.maLoaiPhong === maLoaiPhong).length;
    };

    const showDetailModal = (record) => {
        setSelectedLoaiPhong(record);
    };

    const handleCloseDetailModal = () => {
        setSelectedLoaiPhong(null);
    };

    const columns = [
        {
            title: 'Mã loại phòng',
            dataIndex: 'maLoaiPhong',
            key: 'maLoaiPhong',
            sorter: (a, b) => a.maLoaiPhong - b.maLoaiPhong,
            align: 'center',
        },
        {
            title: 'Tên loại phòng',
            dataIndex: 'tenLoaiPhong',
            key: 'tenLoaiPhong',
            sorter: (a, b) => a.tenLoaiPhong.localeCompare(b.tenLoaiPhong),
            align: 'center',
            render: (text, record) => (
                <Button type="link" onClick={() => showDetailModal(record)}>{text}</Button>
            ),
        },
        {
            title: 'Giá cơ bản',
            dataIndex: 'giaCoBan',
            key: 'giaCoBan',
            render: (text) => text ? `${Number(text).toLocaleString('vi-VN')} VNĐ` : '-',
            sorter: (a, b) => a.giaCoBan - b.giaCoBan,
            align: 'center',
        },
        {
            title: 'Số người tối đa',
            dataIndex: 'soNguoiToiDa',
            key: 'soNguoiToiDa',
            sorter: (a, b) => a.soNguoiToiDa - b.soNguoiToiDa,
            align: 'center',
        },
        {
            title: 'Số lượng phòng',
            key: 'soLuongPhong',
            align: 'center',
            render: (_, record) => getSoLuongPhong(record.maLoaiPhong),
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => showModal(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa loại phòng này?"
                        onConfirm={() => handleDelete(record.maLoaiPhong)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button
                            type="primary"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Quản lý loại phòng</h2>
                <Space>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => showModal()}
                    >
                        Thêm loại phòng
                    </Button>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => fetchLoaiPhongs(pagination.current, pagination.pageSize)}
                    >
                        Làm mới
                    </Button>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={loaiPhongs}
                rowKey="maLoaiPhong"
                pagination={pagination}
                loading={loading}
                onChange={handleTableChange}
                locale={{ emptyText: 'Không có dữ liệu loại phòng' }}
                bordered
            />

            <Modal
                title={editingId ? "Sửa loại phòng" : "Thêm loại phòng mới"}
                open={isModalVisible}
                onOk={handleSubmit}
                onCancel={handleCancel}
                okText={editingId ? "Cập nhật" : "Thêm"}
                cancelText="Hủy"
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="tenLoaiPhong"
                        label="Tên loại phòng"
                        rules={[{ required: true, message: 'Vui lòng nhập tên loại phòng' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="giaCoBan"
                        label="Giá cơ bản"
                        rules={[{ required: true, message: 'Vui lòng nhập giá cơ bản' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            min={0}
                        />
                    </Form.Item>
                    <Form.Item
                        name="soNguoiToiDa"
                        label="Số người tối đa"
                        rules={[{ required: true, message: 'Vui lòng nhập số người tối đa' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={1}
                        />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={selectedLoaiPhong ? `Chi tiết loại phòng: ${selectedLoaiPhong.tenLoaiPhong}` : ''}
                open={!!selectedLoaiPhong}
                onCancel={handleCloseDetailModal}
                footer={null}
                width={700}
            >
                {selectedLoaiPhong && (
                    <div>
                        <p><b>Mã loại phòng:</b> {selectedLoaiPhong.maLoaiPhong}</p>
                        <p><b>Tên loại phòng:</b> {selectedLoaiPhong.tenLoaiPhong}</p>
                        <p><b>Giá cơ bản:</b> {selectedLoaiPhong.giaCoBan?.toLocaleString('vi-VN')} VNĐ</p>
                        <p><b>Số người tối đa:</b> {selectedLoaiPhong.soNguoiToiDa}</p>
                        <h4>Danh sách phòng thuộc loại này:</h4>
                        <Table
                            columns={[
                                { title: 'Mã phòng', dataIndex: 'maPhong', key: 'maPhong' },
                                { title: 'Tên phòng', dataIndex: 'tenPhong', key: 'tenPhong' },
                                { title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai', render: (text) => <Tag>{text}</Tag> },
                            ]}
                            dataSource={phongs.filter(p => p.maLoaiPhong === selectedLoaiPhong.maLoaiPhong)}
                            rowKey="maPhong"
                            pagination={false}
                            size="small"
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default LoaiPhong;
