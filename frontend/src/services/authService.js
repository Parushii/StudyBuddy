import axios from "axios";

const API = "http://localhost:5000/api/auth";

export const signup = (data) => {
  return axios.post(`${API}/signup`, data);
};

export const login = async (data) => {
  const res = await axios.post(`${API}/login`, data);
  console.log("Login response:", res);
  localStorage.setItem("token", res.data.token);
  localStorage.setItem("userId", res.data.userId);
  localStorage.setItem("userName", res.data.name);
  localStorage.setItem("userEmail", res.data.email);

  return res.data;
};

