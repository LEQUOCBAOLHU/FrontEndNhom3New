import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Routes, Route, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dropdown, Space, Avatar } from 'antd';
import { BiMenu, BiSun, BiMoon, BiUser, BiBook, BiChart, BiLogOut, BiHome, BiKey, BiDownArrow } from 'react-icons/bi';
import { useTheme } from '../contexts/ThemeContext';
import { apiFetch } from '../auth';
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
import { MdHotel, MdRoomService, MdMeetingRoom, MdAssignment, MdReceipt, MdAttachMoney, MdMiscellaneousServices } from 'react-icons/md';
import TichDiemAdmin from './TichDiemAdmin';
import LichSuTichDiemAdmin from './LichSuTichDiemAdmin';
import BaoCao from './BaoCao';
import ChangePassword from './ChangePassword';

const menuItems = [
  { icon: <BiHome size={24} />, label: 'Dashboard', path: '/dashboard' },
  { icon: <MdHotel size={24} />, label: 'Phòng', path: '/dashboard/phong' },
  { icon: <MdMeetingRoom size={24} />, label: 'Loại phòng', path: '/dashboard/loaiphong' },
  { icon: <MdRoomService size={24} />, label: 'Dịch vụ', path: '/dashboard/dichvu' },
  { icon: <BiUser size={24} />, label: 'Khách hàng', path: '/dashboard/khachhang' },
  { icon: <BiUser size={24} />, label: 'Nhân viên', path: '/dashboard/nhanvien', adminOnly: true },
  { icon: <BiUser size={24} />, label: 'Tài khoản', path: '/dashboard/account', adminOnly: true },
  { icon: <MdAssignment size={24} />, label: 'Đặt phòng', path: '/dashboard/datphong' },
  { icon: <MdReceipt size={24} />, label: 'Hóa đơn', path: '/dashboard/hoadon' },
  { icon: <BiChart size={24} />, label: 'Thống kê', path: '/dashboard/thongke' },
  { icon: <BiBook size={24} />, label: 'QL Tất cả phòng', path: '/dashboard/quanlyphong', adminOnly: true },
  { icon: <MdAttachMoney size={24} />, label: 'Phụ thu', path: '/dashboard/phuthu' },
  { icon: <MdMiscellaneousServices size={24} />, label: 'Sử dụng dịch vụ', path: '/dashboard/sudungdichvu' },
  { icon: <BiBook size={24} />, label: 'Quản lý tích điểm', path: '/dashboard/tich-diem-admin', adminOnly: true },
  { icon: <BiBook size={24} />, label: 'Lịch sử tích điểm', path: '/dashboard/lich-su-tich-diem-admin', adminOnly: true },
  { icon: <BiBook size={24} />, label: 'Báo cáo', path: '/dashboard/bao-cao', adminOnly: true }
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
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
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
    // Chuyển vai trò về chữ thường để so sánh không phân biệt hoa/thường
    if (role.toLowerCase() === 'quanly') return true;
    return !item.adminOnly;
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);

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
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

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
      <div onClick={handleLogout} className="user-dropdown-item">
        <BiLogOut /> Đăng xuất
      </div>
    </div>
  );
  
  // Lấy tên trang hiện tại từ path
  const currentPage = menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard';

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <motion.div 
        className={`sidebar ${isOpen ? 'open' : ''}`}
        animate={{ width: isOpen ? '240px' : '80px' }}
        transition={{ duration: 0.3, type: "tween" }}
      >
        <div className="sidebar-header">
          <motion.h1 animate={{ opacity: isOpen ? 1 : 0 }}>
            QLKS
          </motion.h1>
          <button className="toggle-btn" onClick={toggleSidebar}>
            <BiMenu size={24} />
          </button>
        </div>

        <div className="sidebar-menu">
          {filteredMenuItems.map((item, index) => (
            <motion.div
              key={item.path}
              className="menu-item"
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to={item.path} className="menu-link">
                {item.icon}
                <motion.span
                  animate={{ opacity: isOpen ? 1 : 0 }}
                  className="menu-label"
                >
                  {item.label}
                </motion.span>
              </Link>
            </motion.div>
          ))}
          
          {/* Theme toggle button */}
          <motion.div
            className="menu-item theme-toggle"
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <button className="menu-link" onClick={toggleTheme}>
              {isDarkMode ? <BiSun size={20} /> : <BiMoon size={20} />}
              <motion.span
                className="menu-label"
                animate={{ opacity: isOpen ? 1 : 0 }}
              >
                {isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'}
              </motion.span>
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className={`main-content ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="top-bar">
          <button className="mobile-menu" onClick={toggleSidebar}>
            <BiMenu size={24} />
          </button>
          <div className="page-title">{currentPage}</div>
          
          <Dropdown overlay={userMenuItems} trigger={['click']}>
            <a onClick={e => e.preventDefault()} className="user-menu-trigger">
              <Space>
                <Avatar icon={<BiUser />} />
                <span>{user.hoTen || 'User'}</span>
                <BiDownArrow />
              </Space>
            </a>
          </Dropdown>
        </div>

        <Routes>
          <Route path="" element={
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
          <Route path="phong" element={<Phong />} />
          <Route path="dichvu" element={<DichVu />} />
          <Route path="khachhang" element={<KhachHang />} />
          <Route path="nhanvien" element={<NhanVien />} />
          <Route path="loaiphong" element={<LoaiPhong />} />
          <Route path="account" element={<Account />} />
          <Route path="datphong" element={<DatPhong />} />
          <Route path="hoadon" element={<HoaDon />} />
          <Route path="thongke" element={<ThongKe />} />
          <Route path="quanlyphong" element={<QuanLyPhong />} />
          <Route path="phuthu" element={<PhuThu />} />
          <Route path="sudungdichvu" element={<SuDungDichVu />} />
          <Route path="tich-diem-admin" element={<TichDiemAdmin />} />
          <Route path="lich-su-tich-diem-admin" element={<LichSuTichDiemAdmin />} />
          <Route path="bao-cao" element={<BaoCao />} />
          <Route path="change-password" element={<ChangePassword />} />
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
      `}</style>
    </div>
  );
};

export default Dashboard;
