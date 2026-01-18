import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/salaries`;

export interface SalaryRecord {
  _id?: string;
  employeeId: string;
  employeeName: string;
  role: "Teacher" | "Staff";
  month: string;
  year: string;
  amount: number;
  date: string;
}

interface SalaryState {
  history: SalaryRecord[];
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: SalaryState = {
  history: [],
  loading: false,
  success: false,
  error: null,
};

// --- API ACTIONS ---

export const paySalary = createAsyncThunk(
  "salary/pay",
  async (record: SalaryRecord, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_URL}/pay`, record);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Payment failed");
    }
  }
);

export const getSalaryHistory = createAsyncThunk(
  "salary/history",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(API_URL);
      return data;
    } catch (error) {
      return rejectWithValue("Failed to fetch history");
    }
  }
);

const salarySlice = createSlice({
  name: "salary",
  initialState,
  reducers: {
    resetSalaryState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(paySalary.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(paySalary.fulfilled, (state, action) => { 
        state.loading = false; 
        state.success = true; 
        state.history.unshift(action.payload);
      })
      .addCase(paySalary.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload as string; 
      })
      .addCase(getSalaryHistory.fulfilled, (state, action) => {
        state.history = action.payload;
      });
  },
});

export const { resetSalaryState } = salarySlice.actions;
export default salarySlice.reducer;