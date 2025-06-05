import React, { useState } from 'react';
import { Card, DatePicker, Button, Space, Table, message } from 'antd';
import { apiFetch } from '../auth';
import './ThongKe.css';

function ThongKe() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('ngay');
  const [date, setDate] = useState(null);
  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(null);
  const [range, setRange] = useState([]);

  const columns = [
    { title: 'Tên dịch vụ', dataIndex: 'tenDichVu', key: 'tenDichVu' },
    { title: 'Số lượng', dataIndex: 'soLuong', key: 'soLuong' },
    { title: 'Doanh thu', dataIndex: 'doanhThu', key: 'doanhThu' },
  ];

  const fetchThongKe = async () => {
    setLoading(true);
    let url = '';
    if (type === 'ngay' && date) {
      url = `http://localhost:5189/api/ThongKe/ngay?ngay=${date.format('YYYY-MM-DD')}`;
    } else if (type === 'thang' && month && year) {
      url = `http://localhost:5189/api/ThongKe/thang?nam=${year}&thang=${month}`;
    } else if (type === 'nam' && year) {
      url = `http://localhost:5189/api/ThongKe/nam?nam=${year}`;
    } else if (type === 'khoang' && range.length === 2) {
      url = `http://localhost:5189/api/ThongKe/khoang-thoi-gian?tuNgay=${range[0].format('YYYY-MM-DD')}&denNgay=${range[1].format('YYYY-MM-DD')}`;
    } else {
      message.error('Vui lòng chọn đủ thông tin!');
      setLoading(false);
      return;
    }
    try {
      const res = await apiFetch(url);
      const resData = await res.json();
      setData(Array.isArray(resData) ? resData : []);
    } catch (e) {
      setData([]);
      message.error('Lỗi lấy dữ liệu thống kê!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Thống kê doanh thu dịch vụ" style={{margin:24}}>
      <Space style={{marginBottom:16}}>
        <Button type={type==='ngay'?'primary':'default'} onClick={()=>setType('ngay')}>Theo ngày</Button>
        <Button type={type==='thang'?'primary':'default'} onClick={()=>setType('thang')}>Theo tháng</Button>
        <Button type={type==='nam'?'primary':'default'} onClick={()=>setType('nam')}>Theo năm</Button>
        <Button type={type==='khoang'?'primary':'default'} onClick={()=>setType('khoang')}>Khoảng thời gian</Button>
      </Space>
      <Space style={{marginBottom:16}}>
        {type==='ngay' && <DatePicker onChange={setDate} />}
        {type==='thang' && <><DatePicker picker="month" onChange={d=>{setMonth(d?.month()+1);setYear(d?.year())}} /></>}
        {type==='nam' && <DatePicker picker="year" onChange={d=>setYear(d?.year())} />}
        {type==='khoang' && <DatePicker.RangePicker onChange={setRange} />}
        <Button type="primary" onClick={fetchThongKe} loading={loading}>Thống kê</Button>
      </Space>
      <Table columns={columns} dataSource={data} loading={loading} rowKey={(r,i)=>i} />
    </Card>
  );
}

export default ThongKe;
