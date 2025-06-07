import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, Select, 
  Typography, Spin, message, DatePicker, Space 
} from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiFetch } from '../auth';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

function ThongKe() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [dateRange, setDateRange] = useState(null);
  const [customRangeRevenue, setCustomRangeRevenue] = useState(null);
  const [loadingCustom, setLoadingCustom] = useState(false);

  const fetchStats = async (y, m) => {
    setLoading(true);
    try {
      const yearPromise = apiFetch(`https://qlks-0dvh.onrender.com/api/ThongKe/nam?nam=${y}`);
      const monthPromise = apiFetch(`https://qlks-0dvh.onrender.com/api/ThongKe/thang?nam=${y}&thang=${m}`);
      
      const [yearRes, monthRes] = await Promise.all([yearPromise, monthPromise]);
      
      if (!yearRes.ok || !monthRes.ok) {
        throw new Error('Không thể lấy dữ liệu thống kê');
      }

      const yearStats = await yearRes.json();
      const monthStats = await monthRes.json();
      
      if(yearStats.data && monthStats.data) {
        setStats({
          year: yearStats.data,
          month: monthStats.data
        });
      } else {
        message.error('Không có dữ liệu thống kê cho thời gian đã chọn.');
        setStats(null);
      }

    } catch (error) {
      console.error("Lỗi khi tải dữ liệu thống kê:", error);
      message.error(error.message || 'Lỗi khi tải dữ liệu thống kê.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomRangeStats = async () => {
    if (!dateRange || dateRange.length !== 2 || !dateRange[0] || !dateRange[1]) {
      setCustomRangeRevenue(null);
      return;
    }
    setLoadingCustom(true);
    try {
      const tuNgay = dateRange[0].format('YYYY-MM-DD');
      const denNgay = dateRange[1].format('YYYY-MM-DD');
      const res = await apiFetch(`https://qlks-0dvh.onrender.com/api/ThongKe/khoang-thoi-gian?tuNgay=${tuNgay}&denNgay=${denNgay}`);
      if (!res.ok) {
        throw new Error('Không thể tải doanh thu cho khoảng thời gian tùy chỉnh.');
      }
      const data = await res.json();
      setCustomRangeRevenue(data.data);
    } catch (error) {
      console.error("Lỗi khi tải thống kê tùy chỉnh:", error);
      message.error(error.message);
      setCustomRangeRevenue(null);
    } finally {
      setLoadingCustom(false);
    }
  };

  useEffect(() => {
    fetchStats(year, month);
  }, [year, month]);

  useEffect(() => {
    fetchCustomRangeStats();
  }, [dateRange]);

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '0 VNĐ';
    return `${Math.round(value).toLocaleString('vi-VN')} VNĐ`;
  };

  const revenueByMonthData = stats?.year?.doanhThuTheoThang?.map(item => ({
    name: `Tháng ${item.thang}`,
    'Doanh thu': item.tongDoanhThu,
  })) || [];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Bảng thống kê</Title>
      
      <Row gutter={[16, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
            <Title level={4}>Thống kê theo tháng / năm</Title>
            <Space>
                <Select value={year} onChange={setYear} style={{ width: 120 }}>
                    {years.map(y => <Option key={y} value={y}>{y}</Option>)}
                </Select>
                <Select value={month} onChange={setMonth} style={{ width: 120 }}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <Option key={m} value={m}>Tháng {m}</Option>)}
                </Select>
            </Space>
        </Col>
        <Col xs={24} md={12}>
           <Title level={4}>Thống kê theo khoảng thời gian tùy chỉnh</Title>
           <RangePicker value={dateRange} onChange={setDateRange} />
        </Col>
      </Row>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : stats ? (
        <>
          <Title level={4}>Thống kê tháng {month}/{year}</Title>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic title="Doanh thu tháng" value={formatCurrency(stats.month.tongDoanhThu)} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic title="Số hóa đơn" value={stats.month.soLuongHoaDon} />
              </Card>
            </Col>
          </Row>

          <Title level={4}>Thống kê năm {year}</Title>
          <Row gutter={16} style={{ marginBottom: 24 }}>
             <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic title="Tổng doanh thu năm" value={formatCurrency(stats.year.tongDoanhThu)} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic title="Tổng số hóa đơn năm" value={stats.year.tongSoHoaDon} />
              </Card>
            </Col>
          </Row>

          <Card style={{ marginBottom: 24 }}>
            <Title level={5}>Biểu đồ doanh thu theo tháng - Năm {year}</Title>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={revenueByMonthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={val => formatCurrency(val)} />
                <Tooltip formatter={val => formatCurrency(val)} />
                <Legend />
                <Bar dataKey="Doanh thu" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </>
      ) : (
         <div style={{ textAlign: 'center', padding: '50px' }}>
            <Title level={5}>Nhân Viên Không Được Xem Thống Kê</Title>
         </div>
      )}

      {loadingCustom && 
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin />
        </div>
      }
      {customRangeRevenue && !loadingCustom && (
        <Card>
            <Title level={4}>
                Doanh thu từ {dateRange[0].format('DD/MM/YYYY')} đến {dateRange[1].format('DD/MM/YYYY')}
            </Title>
            <Row gutter={16}>
                <Col xs={24} sm={12}>
                    <Statistic title="Tổng doanh thu" value={formatCurrency(customRangeRevenue.tongDoanhThu)} />
                </Col>
                <Col xs={24} sm={12}>
                    <Statistic title="Số hóa đơn" value={customRangeRevenue.soLuongHoaDon} />
                </Col>
            </Row>
        </Card>
      )}
    </div>
  );
}

export default ThongKe;
