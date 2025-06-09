import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Routes, Route, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dropdown, Space, Avatar } from 'antd';
import { BiMenu, BiUser, BiBook, BiChart, BiLogOut, BiHome, BiKey, BiDownArrow } from 'react-icons/bi';
import { useTheme } from '../contexts/ThemeContext';
import { apiFetch } from '../auth';
import Switch from './Switch';
import Phong from './Phong';
import DichVu from './DichVu';
import KhachHang from './KhachHang';
import NhanVien from './NhanVien';
import LoaiPhong from './LoaiPhong';
import Account from './Account';
import DatPhong from './DatPhong';
import HoaDon from './HoaDon';
import ThongKe from './ThongKe';
import QuanLyPhong from './QuanLyPhong';
import PhuThu from './PhuThu';
import SuDungDichVu from './SuDungDichVu';
import './Dashboard.css';

// Icons import
import { MdHotel, MdRoomService, MdMeetingRoom, MdAssignment, MdReceipt, MdAttachMoney, MdMiscellaneousServices, MdDashboard, MdPeople, MdPriceChange, MdBarChart, MdAssessment, MdPerson } from 'react-icons/md';
import ChangePassword from './ChangePassword';

const menuItems = [
  { icon: <MdDashboard size={24} />, label: 'Dashboard', path: '/dashboard' },
  { icon: <MdPeople size={24} />, label: 'Khách hàng', path: '/dashboard/khachhang' },
  { icon: <MdMeetingRoom size={24} />, label: 'Phòng', path: '/dashboard/phong' },
  { icon: <MdRoomService size={24} />, label: 'Dịch vụ', path: '/dashboard/dichvu' },
  { icon: <MdReceipt size={24} />, label: 'Hóa đơn', path: '/dashboard/hoadon' },
  { icon: <MdAssignment size={24} />, label: 'Đặt phòng', path: '/dashboard/datphong' },
  { icon: <BiBook size={24} />, label: 'QL Tất cả phòng', path: '/dashboard/quanlyphong', adminOnly: true },
  { icon: <MdPriceChange size={24} />, label: 'Phụ thu', path: '/dashboard/phuthu' },
  { icon: <MdMiscellaneousServices size={24} />, label: 'Sử dụng dịch vụ', path: '/dashboard/sudungdichvu' },
  { icon: <MdBarChart size={24} />, label: 'Thống kê', path: '/dashboard/thongke' },
  { icon: <MdPerson size={24} />, label: 'Tài khoản', path: '/dashboard/account' },
];

const StatCard = ({ icon, label, value, type }) => (
  <motion.div 
    className={`stat-card ${type}`}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="stat-icon">{icon}</div>
    <div className="stat-info">
      <h3>{value}</h3>
      <p>{label}</p>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    availableRooms: 0,
    occupiedRooms: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  console.log("Thông tin user từ localStorage:", user);
  const role = user.vaiTro || user.role || '';

  // Lọc menu items dựa trên vai trò
  const filteredMenuItems = menuItems.filter(item => {
    // Luôn hiển thị mục 'Tài khoản' (Account) cho mọi vai trò
    if (item.label === 'Tài khoản') return true;
    // Chuyển vai trò về chữ thường để so sánh không phân biệt hoa/thường
    if (role.toLowerCase() === 'quanly') return true;
    return !item.adminOnly;
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoadingStats(true);
      try {
        let totalRevenue = 0;
        
        // Revenue is only available for 'QuanLy' role
        console.log("Kiểm tra vai trò:", role); // Log 1: Check role
        if (role.toLowerCase() === 'quanly') {
          const startDate = '2000-01-01';
          const endDate = new Date().toISOString().split('T')[0]; // Today's date
          const revenueResponse = await apiFetch(`http://localhost:5189/api/ThongKe/khoang-thoi-gian?tuNgay=${startDate}&denNgay=${endDate}`);
          
          if (revenueResponse.ok) {
            const revenueData = await revenueResponse.json();
            console.log("Dữ liệu doanh thu từ API:", revenueData); // Log 2: Check API response
            totalRevenue = revenueData.data?.tongDoanhThu || 0;
            console.log("Doanh thu đã xử lý:", totalRevenue); // Log 3: Check processed value
          } else {
            console.warn(`Không thể tải doanh thu, status: ${revenueResponse.status}`);
          }
        }

        // 1. Get total bookings from HoaDon endpoint (accessible by NhanVien)
        const hoaDonResponse = await apiFetch('http://localhost:5189/api/hoadon?pageSize=1');
        const hoaDonData = await hoaDonResponse.json();
        const totalBookings = hoaDonData.data?.totalItems || 0;
        
        // 2. Get room status statistics (accessible by NhanVien)
        const roomStatusResponse = await apiFetch('http://localhost:5189/api/Phong/thong-ke-trang-thai');
        const roomStatusData = await roomStatusResponse.json();
        const availableRooms = roomStatusData.data?.['Trống'] || 0;
        const occupiedRooms = roomStatusData.data?.['Đang sử dụng'] || 0;

        setDashboardStats({
            totalRevenue,
            totalBookings,
            availableRooms,
            occupiedRooms,
        });

      } catch (error) {
        console.error("Lỗi khi tải thống kê cho dashboard:", error);
        // Set default values on error to avoid crash
        setDashboardStats({
            totalRevenue: 0,
            totalBookings: 0,
            availableRooms: 0,
            occupiedRooms: 0,
        });
      } finally {
        setLoadingStats(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const handleLogout = async () => {
    try {
      await apiFetch('http://localhost:5189/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    } finally {
      // Luôn xóa thông tin local dù API có lỗi hay không
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    navigate('/login');
    }
  };

  const formatCurrency = (value) => {
    if (!value) return '0 VNĐ';
    return `${Math.round(value).toLocaleString('vi-VN')} VNĐ`;
  };

  const stats = [
    { icon: <MdHotel size={32} />, label: 'Phòng trống', value: loadingStats ? '...' : dashboardStats.availableRooms, type: 'primary' },
    { icon: <MdRoomService size={32} />, label: 'Đang sử dụng', value: loadingStats ? '...' : dashboardStats.occupiedRooms, type: 'success' },
    { icon: <MdAssignment size={32} />, label: 'Tổng đặt phòng', value: loadingStats ? '...' : dashboardStats.totalBookings, type: 'warning' },
    { icon: <BiChart size={32} />, label: 'Doanh thu', value: loadingStats ? '...' : formatCurrency(dashboardStats.totalRevenue), type: 'info' },
  ];

  const userMenuItems = (
    <div className="user-dropdown-menu">
      <Link to="/dashboard/change-password" className="user-dropdown-item">
        <BiKey /> Đổi mật khẩu
      </Link>
      <button onClick={handleLogout} className="user-dropdown-item" style={{background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: 0}}>
        <BiLogOut /> Đăng xuất
      </button>
    </div>
  );
  
  // Lấy tên trang hiện tại từ path
  const currentPage = menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard';

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <motion.div 
        className="sidebar open"
        animate={{ width: '240px' }}
        transition={{ duration: 0.3, type: "tween" }}
      >
        <div className="sidebar-header">
          <motion.h1 animate={{ opacity: 1 }}>
            QLKS
          </motion.h1>
        </div>
        <div className="sidebar-menu">
          {filteredMenuItems.map((item, index) => (
            <motion.div
              key={item.path}
              className="menu-item"
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to={item.path} 
                className={`menu-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.icon}
                <motion.span
                  animate={{ opacity: 1 }}
                  className="menu-label"
                >
                  {item.label}
                </motion.span>
              </Link>
            </motion.div>
          ))}
          <div className="sidebar-user-menu">
            <Dropdown overlay={userMenuItems} trigger={['click']} placement="topLeft">
              <a onClick={e => e.preventDefault()} className="user-menu-trigger">
                <Space>
                  <Avatar icon={<BiUser />} />
                  <span>{user.hoTen || 'User'}</span>
                  <BiDownArrow />
                </Space>
              </a>
            </Dropdown>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="main-content sidebar-open">
        <div className="top-bar">
          <div className="page-title">{currentPage}</div>
          <div className="top-bar-right">
            <Switch isDarkMode={isDarkMode} onChange={toggleTheme} />
          </div>
        </div>

        <Routes>
          <Route path="/" element={
            <div className="dashboard-content">
              <div className="welcome-section">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Chào mừng đến với Hệ thống Quản lý Khách sạn
                </motion.h1>
              </div>

              <div className="stats-grid">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <StatCard {...stat} />
                  </motion.div>
                ))}
              </div>

              <div className="quick-actions">
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Thao tác nhanh
                </motion.h2>
                <div className="action-buttons">
                  {filteredMenuItems.slice(1).map((item, index) => (
                    <motion.button
                      key={item.path}
                      className="action-button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(item.path)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          } />
          <Route path="khachhang" element={<KhachHang />} />
          <Route path="phong" element={<Phong />} />
          <Route path="dichvu" element={<DichVu />} />
          <Route path="hoadon" element={<HoaDon />} />
          <Route path="datphong" element={<DatPhong />} />
          <Route path="quanlyphong" element={<QuanLyPhong />} />
          <Route path="phuthu" element={<PhuThu />} />
          <Route path="sudungdichvu" element={<SuDungDichVu />} />
          <Route path="thongke" element={<ThongKe />} />
          <Route path="account" element={<Account />} />
        </Routes>
      </main>

      <style>{`
        @media (max-width: 900px) {
          .dashboard-container { flex-direction: column; }
          .sidebar { width: 100vw !important; position:relative; }
          .main-content { padding: 8px; }
        }
        @media (max-width: 600px) {
          .sidebar { font-size: 14px; }
          .main-content { padding: 2px; }
          .stats-grid { grid-template-columns: 1fr !important; }
          .action-buttons { flex-direction: column; gap: 8px; }
        }

        .dashboard-container {
          background: var(--background-dark);
          min-height: 100vh;
          width: 100%;
          display: flex;
        }

        .main-content {
          flex: 1;
          background: inherit;
          min-height: 100vh;
          overflow-y: auto;
        }

        [data-theme='dark'] .dashboard-container,
        [data-theme='dark'] .main-content {
          background: #1a1a2e;
        }

        [data-theme='light'] .dashboard-container,
        [data-theme='light'] .main-content {
          background: #f0f2f5;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
