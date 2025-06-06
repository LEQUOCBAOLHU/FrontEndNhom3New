import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Row,
  Col,
  DatePicker,
  Select,
  Space,
  Typography,
  Statistic,
} from 'antd';
import { Line, Bar, Pie } from '@ant-design/plots';
import { formatCurrency } from '../../utils/format';
import axios from 'axios';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const ThongKe = () => {
  const [dateRange, setDateRange] = useState([]);
  const [statistics, setStatistics] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    averageRoomRate: 0,
    occupancyRate: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [roomTypeData, setRoomTypeData] = useState([]);
  const [paymentMethodData, setPaymentMethodData] = useState([]);

  useEffect(() => {
    fetchStatistics();
  }, [dateRange]);

  const fetchStatistics = async () => {
    try {
      const response = await axios.get('/api/statistics', {
        params: {
          startDate: dateRange[0]?.format('YYYY-MM-DD'),
          endDate: dateRange[1]?.format('YYYY-MM-DD'),
        },
      });
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const revenueConfig = {
    data: revenueData,
    xField: 'date',
    yField: 'revenue',
    seriesField: 'type',
    yAxis: {
      label: {
        formatter: (v) => formatCurrency(v),
      },
    },
  };

  const roomTypeConfig = {
    data: roomTypeData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
  };

  const paymentMethodConfig = {
    data: paymentMethodData,
    xField: 'method',
    yField: 'amount',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
  };

  return (
    <div className="p-6">
      <Title level={2}>Thống Kê</Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Space>
            <RangePicker
              onChange={(dates) => setDateRange(dates)}
              style={{ width: 300 }}
            />
            <Select
              defaultValue="daily"
              style={{ width: 120 }}
              options={[
                { value: 'daily', label: 'Theo ngày' },
                { value: 'weekly', label: 'Theo tuần' },
                { value: 'monthly', label: 'Theo tháng' },
              ]}
            />
          </Space>
        </Card>

        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng Doanh Thu"
                value={statistics.totalRevenue}
                formatter={(value) => formatCurrency(value)}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng Số Đặt Phòng"
                value={statistics.totalBookings}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Giá Phòng Trung Bình"
                value={statistics.averageRoomRate}
                formatter={(value) => formatCurrency(value)}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tỷ Lệ Lấp Đầy"
                value={statistics.occupancyRate}
                suffix="%"
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={16}>
            <Card title="Doanh Thu Theo Thời Gian">
              <Line {...revenueConfig} />
            </Card>
          </Col>
          <Col span={8}>
            <Card title="Phân Bố Loại Phòng">
              <Pie {...roomTypeConfig} />
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Card title="Phương Thức Thanh Toán">
              <Bar {...paymentMethodConfig} />
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};

export default ThongKe; 