import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/fees`;

export interface FeeRecord {
  _id?: string;
  studentId: string;
  studentName: string;
  classname: string;
  roll_no: string;
  month: string;
  year: string;
  usesBus: boolean;
  monthly_fees: number;
  exam_fees: number;
  other_fee: number;
  fine: number;
  totalAmount: number;
  paymentMode: string;
  receiptNo: string;
  date: string;
  notes: string;
}

interface FeeState {
  history: FeeRecord[];
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: FeeState = {
  history: [],
  loading: false,
  success: false,
  error: null,
};

// --- API ACTIONS ---

export const payFees = createAsyncThunk(
  "fees/pay",
  async (feeData: FeeRecord, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_URL}/pay`, feeData);
      return data;
    } catch (error: any) {
      // Backend returns 400 for duplicates with a message
      return rejectWithValue(error.response?.data?.message || "Failed to process payment");
    }
  }
);

export const getFeeHistory = createAsyncThunk(
  "fees/history",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(API_URL);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to load history");
    }
  }
);

const feeSlice = createSlice({
  name: "fees",
  initialState,
  reducers: {
    resetFeeState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(payFees.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(payFees.fulfilled, (state, action) => { 
        state.loading = false; 
        state.success = true; 
        state.history.unshift(action.payload); // Add new record to top
      })
      .addCase(payFees.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload as string; 
      })
      .addCase(getFeeHistory.fulfilled, (state, action) => {
        state.history = action.payload;
      });
  },
});

export const { resetFeeState } = feeSlice.actions;
export default feeSlice.reducer;