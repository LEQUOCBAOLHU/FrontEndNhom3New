import React, { useEffect, useState } from 'react';
import { Card, Spin, message } from 'antd';
import { apiFetch } from '../auth';
import './HomeUser.css';

export default function HomeUser() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInfo();
  }, []);

  const fetchInfo = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('http://localhost:5189/api/ThongTinKhachSan');
      const data = await res.json();
      setInfo(data.data || data);
    } catch (e) {
      setInfo(null);
      message.error('Không thể lấy thông tin khách sạn!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-user-container">
      <h2>Trang chủ khách hàng</h2>
      <Spin spinning={loading}>
        {info ? (
          <Card bordered={false}>
            <h3>{info.tenKhachSan}</h3>
            {info.anh && <img src={info.anh} alt="Ảnh khách sạn" style={{maxWidth:300,marginBottom:16}} />}
            <p><b>Địa chỉ:</b> {info.diaChi}</p>
            <p><b>Hotline:</b> {info.hotline}</p>
            <p><b>Email:</b> {info.email}</p>
            <p><b>Mô tả:</b> {info.moTa}</p>
          </Card>
        ) : (
          <div style={{textAlign:'center',color:'#888'}}>Không có thông tin khách sạn.</div>
        )}
      </Spin>
    </div>
  );
}
