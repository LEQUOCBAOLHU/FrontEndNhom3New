import React, { useEffect, useState } from 'react';
import { Card, Spin, message } from 'antd';
import { apiFetch } from '../auth';
import './LienHeUser.css';

export default function LienHeUser() {
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
      message.error('Không thể lấy thông tin liên hệ!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lienhe-user-container">
      <h2>Liên hệ khách sạn</h2>
      <Spin spinning={loading}>
        {info ? (
          <Card bordered={false}>
            <p><b>Địa chỉ:</b> {info.diaChi}</p>
            <p><b>Hotline:</b> {info.hotline}</p>
            <p><b>Email:</b> {info.email}</p>
            <p><b>Mô tả:</b> {info.moTa}</p>
          </Card>
        ) : (
          <div style={{textAlign:'center',color:'#888'}}>Không có thông tin liên hệ.</div>
        )}
      </Spin>
    </div>
  );
}
