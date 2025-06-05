// auth.js
let isRefreshing = false;

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AuthDB', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore('tokens', { keyPath: 'id' });
    };
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

const getToken = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['tokens'], 'readonly');
    const store = transaction.objectStore('tokens');
    const request = store.get('auth');
    
    request.onsuccess = () => {
      resolve(request.result || { token: undefined, refreshToken: undefined });
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
};

const saveToken = async (token, refreshToken) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['tokens'], 'readwrite');
    const store = transaction.objectStore('tokens');
    const request = store.put({ id: 'auth', token, refreshToken });
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

const clearTokens = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['tokens'], 'readwrite');
    const store = transaction.objectStore('tokens');
    const request = store.delete('auth');
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const refreshToken = async (oldToken, oldRefreshToken) => {
  if (isRefreshing) {
    throw new Error('Hệ thống đang xử lý. Vui lòng thử lại sau.');
  }

  isRefreshing = true;
  try {
    console.log('Refreshing token with oldToken:', oldToken, 'oldRefreshToken:', oldRefreshToken);
    const refreshResponse = await fetch('http://localhost:5189/api/Auth/tokens/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: oldToken, refreshToken: oldRefreshToken })
    });

    const responseText = await refreshResponse.text();
    console.log('Refresh response text:', responseText);

    if (!refreshResponse.ok) {
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }

    let refreshData;
    try {
      refreshData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Parse error:', parseError);
      throw new Error('Không thể xử lý dữ liệu từ hệ thống. Vui lòng thử lại.');
    }

    if (!refreshData.token || !refreshData.refreshToken) {
      throw new Error('Thông tin xác thực không đầy đủ. Vui lòng đăng nhập lại.');
    }

    await saveToken(refreshData.token, refreshData.refreshToken);
    const newTokens = await getToken();

    if (!newTokens.token) {
      throw new Error('Không thể cập nhật phiên đăng nhập. Vui lòng đăng nhập lại.');
    }

    console.log('New tokens:', newTokens);
    return newTokens;
  } catch (refreshError) {
    console.error('Refresh token error:', refreshError);
    throw refreshError;
  } finally {
    isRefreshing = false;
  }
};

export const apiFetch = async (url, options = {}) => {
  let attempt = 0;
  const maxAttempts = 2; // Giới hạn số lần thử lại

  while (attempt < maxAttempts) {
    try {
      const tokens = await getToken();
      console.log('Current tokens:', tokens);

      if (!tokens.token) {
        throw new Error('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.token}`,
        ...options.headers,
      };

      console.log(`Fetching ${url} with headers:`, headers);
      let response = await fetch(url, { ...options, headers });

      if (response.status === 401 && tokens.refreshToken && !isRefreshing) {
        console.log('401 received, attempting to refresh token');
        const newTokens = await refreshToken(tokens.token, tokens.refreshToken);
        headers.Authorization = `Bearer ${newTokens.token}`;
        response = await fetch(url, { ...options, headers }); // Gọi lại với token mới
      }

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${await response.text()}`);
      }

      return response;
    } catch (error) {
      console.error(`API Fetch error (attempt ${attempt + 1}/${maxAttempts}):`, error);
      if (attempt === maxAttempts - 1) throw error;
      attempt++;
      if (error.message.includes('Phiên đăng nhập đã hết hạn') || error.message.includes('Không hợp lệ')) {
        break; // Thoát nếu lỗi liên quan đến phiên đăng nhập
      }
      await new Promise(resolve => setTimeout(resolve, 1000)); // Chờ 1 giây trước khi thử lại
    }
  }
};

export const saveAuthTokens = saveToken;
export const clearAuthTokens = clearTokens;

// Thêm hàm lưu id nhân viên khi login
export async function loginAndSaveStaffId(email, password) {
  const res = await fetch('http://localhost:5189/api/Auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, matKhau: password })
  });
  if (!res.ok) throw new Error('Đăng nhập thất bại');
  const data = await res.json();
  await saveToken(data.token, data.refreshToken);
  if (data.idNhanVien) localStorage.setItem('nhanVienId', data.idNhanVien);
  return data;
}

// Đăng nhập bằng token có sẵn (dùng cho test hoặc đăng nhập nhanh)
export async function loginWithToken(token, refreshToken, userInfo) {
  await saveToken(token, refreshToken);
  if (userInfo?.idNhanVien) localStorage.setItem('nhanVienId', userInfo.idNhanVien);
  if (userInfo?.hoTen) localStorage.setItem('user', JSON.stringify(userInfo));
}