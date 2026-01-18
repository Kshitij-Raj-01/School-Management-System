import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import { logout } from "./store/slices/authSlice"; // Import logout action
import App from "./App.tsx";
import "./index.css";
import axios from "axios";

// --- AXIOS SETUP ---
const userInfo = localStorage.getItem('userCred') 
  ? JSON.parse(localStorage.getItem('userCred')!) 
  : null;

// Set initial header if user is already logged in
if (userInfo && userInfo.token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${userInfo.token}`;
}

// Interceptor: Check every response for 401 Unauthorized
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If 401, it means Token Expired or Invalid
      store.dispatch(logout()); // Clear Redux state
      window.location.href = "/login"; // Force redirect
    }
    return Promise.reject(error);
  }
);
// -------------------------

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
  </Provider>
);