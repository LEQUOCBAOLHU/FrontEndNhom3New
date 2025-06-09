import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, Select, 
  Typography, Spin, message, DatePicker, Space 
} from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiFetch } from '../auth';
import { useTheme } from '../contexts/ThemeContext';
import dayjs from 'dayjs';
import './ThongKe.css';

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
  const { isDarkMode } = useTheme();

  const fetchStats = async (y) => {
    setLoading(true);
    try {
      const response = await apiFetch(`http://localhost:5189/api/ThongKe/nam?nam=${y}`);
      
      if (!response.ok) {
        throw new Error('Không thể lấy dữ liệu thống kê');
      }

      const data = await response.json();
      console.log("Data received:", data); // For debugging
      
      if (data.data) {
        setStats(data.data);
      } else {
        message.error('Không có dữ liệu thống kê cho năm đã chọn.');
        setStats(null);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu thống kê:", error);
      message.error(error.message || 'Lỗi khi tải dữ liệu thống kê.');
      setStats(null);
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
    fetchStats(year);
  }, [year]);

  useEffect(() => {
    fetchCustomRangeStats();
  }, [dateRange]);

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '0 VNĐ';
    return `${Math.round(value).toLocaleString('vi-VN')} VNĐ`;
  };

  // Transform data for the chart
  const revenueByMonthData = React.useMemo(() => {
    if (!stats?.doanhThuTheoThang) return [];
    
    // Create an array for all 12 months with 0 revenue
    const monthlyData = Array.from({ length: 12 }, (_, index) => ({
      name: `Tháng ${index + 1}`,
      'Doanh thu': 0
    }));

    // Fill in actual revenue data
    stats.doanhThuTheoThang.forEach(item => {
      if (item.thang >= 1 && item.thang <= 12) {
        monthlyData[item.thang - 1]['Doanh thu'] = item.tongDoanhThu;
      }
    });

    return monthlyData;
  }, [stats]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="thongke-container">
      <Title level={2} style={{ color: isDarkMode ? '#fff' : undefined }}>
        Thống kê năm {year}
      </Title>
      
      <Row gutter={[16, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card>
            <Statistic 
              title="Tổng doanh thu năm" 
              value={formatCurrency(stats?.tongDoanhThu)}
              className={isDarkMode ? 'dark-mode-statistic' : ''}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card>
            <Statistic 
              title="Tổng số hóa đơn năm" 
              value={stats?.tongSoHoaDon || 0}
              suffix="hóa đơn"
              className={isDarkMode ? 'dark-mode-statistic' : ''}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 24 }}>
        <Title level={4} style={{ color: isDarkMode ? '#fff' : undefined }}>
          Biểu đồ doanh thu theo tháng - Năm {year}
        </Title>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart 
              data={revenueByMonthData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#303030' : '#ccc'} />
              <XAxis 
                dataKey="name" 
                stroke={isDarkMode ? '#fff' : '#666'}
              />
              <YAxis 
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                stroke={isDarkMode ? '#fff' : '#666'}
              />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#1f1f1f' : '#fff',
                  border: '1px solid #ccc'
                }}
                labelStyle={{ color: isDarkMode ? '#fff' : '#666' }}
              />
              <Legend wrapperStyle={{ color: isDarkMode ? '#fff' : '#666' }} />
              <Bar 
                dataKey="Doanh thu" 
                fill="#8884d8" 
                name="Doanh thu"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Select 
            value={year} 
            onChange={setYear} 
            style={{ width: 120, marginRight: 16 }}
            dropdownStyle={{ backgroundColor: isDarkMode ? '#1f1f1f' : '#fff' }}
          >
            {years.map(y => (
              <Option key={y} value={y}>{y}</Option>
            ))}
          </Select>
        </Col>
      </Row>
    </div>
  );
}

export default ThongKe;
