import axios from "axios";
import { Expense } from "../types/expense";
import { handleLogout } from "../utils/authHelper";

export const API = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

/* Axios Interceptor: Auto logout if 401 */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      handleLogout();
    }
    return Promise.reject(error);
  }
);

export const getUserToken = async ({ username, password }: { username: string; password: string }) => {
  const res = await API.post("/users/login", { username, password });
  return res.data.access_token
};

export const addNewUser = async (newUser: any) => {
  await API.post("/users/register", newUser);
};

export const getExpenses = async (token: string) => {
  const res = await API.get("/expenses", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const addExpense = async (expense: Partial<Expense>, token: string) => {
  const res = await API.post("/expenses", expense, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateExpense = async (id: number | null, expense: Partial<Expense>, token: string) => {
  const res = await API.put(`/expenses/${id}`, expense, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteExpense = async (id: number, token: string) => {
  await API.delete(`/expenses/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getSummaryByCategory = async (token: string) => {
  const response = await API.get('/expenses/summary', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getSummaryByMonth = async (token: string) => {
  const response = await API.get('/expenses/summary?group_by=month', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
