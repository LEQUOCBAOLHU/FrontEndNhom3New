import React, { useEffect, useState } from 'react';
import { Spin, Card, Row, Col } from 'antd';
import { apiFetch } from '../auth';
import './GioiThieuUser.css';

export default function GioiThieuUser() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGioiThieu();
  }, []);

  const fetchGioiThieu = async () => {
    setLoading(true);
    try {
      // Giả sử backend có API /api/ThongTinKhachSan hoặc /api/GioiThieu
      const res = await apiFetch('http://localhost:5189/api/ThongTinKhachSan');
      const data = await res.json();
      setInfo(data.data || data); // Chuẩn hóa lấy data
    } catch {
      setInfo(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gioithieu-user-container">
      <h2>Giới thiệu khách sạn</h2>
      <Spin spinning={loading}>
        {info ? (
          <Card bordered={false} className="gioithieu-card">
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <img src={info.hinhAnh || '/logo512.png'} alt="Khách sạn" style={{width:'100%',borderRadius:16}} />
              </Col>
              <Col xs={24} md={12}>
                <h3>{info.tenKhachSan}</h3>
                <p><b>Địa chỉ:</b> {info.diaChi}</p>
                <p><b>Hotline:</b> {info.soDienThoai}</p>
                <p><b>Email:</b> {info.email}</p>
                <div className="gioithieu-desc">{info.moTa || info.gioiThieu}</div>
              </Col>
            </Row>
          </Card>
        ) : (
          <div style={{textAlign:'center',color:'#888'}}>Không có dữ liệu giới thiệu khách sạn.</div>
        )}
      </Spin>
    </div>
  );
}
