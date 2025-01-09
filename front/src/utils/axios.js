import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_NODE_SERVER_URL,
  timeout: 30000,  // 타임아웃 설정
  withCredentials: true,  // CORS 요청에 필요
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  function (config) {
    console.log('Request URL:', config.baseURL + config.url);
    console.log('Request Method:', config.method);
    console.log('Request Data:', config.data);
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  function (response) {
    console.log('Response Success:', response.status);
    return response;
  },
  function (error) {
    if (error.code === 'ECONNABORTED') {
      console.error('Timeout Error:', error);
      alert('서버 응답 시간이 초과되었습니다. 네트워크 상태를 확인해주세요.');
    } else if (!error.response) {
      console.error('Network Error:', error);
      alert('서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.');
    }
    if (error.response?.data === "jwt expired") {
      localStorage.removeItem("accessToken"); // 만료된 토큰 제거
      // window.location.reload();
      alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
