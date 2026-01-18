import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/attendance`;

export interface AttendanceRecord {
  _id: string;
  date: string;
  classname: string;
  subject?: string;
  records: {
    studentId: string;
    studentName: string;
    roll_no: string;
    status: "Present" | "Absent";
  }[];
}

interface AttendanceState {
  history: AttendanceRecord[];
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: AttendanceState = {
  history: [],
  loading: false,
  success: false,
  error: null,
};

// --- API ACTIONS ---

export const markAttendance = createAsyncThunk(
  "attendance/mark",
  async (record: Omit<AttendanceRecord, "_id">, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(API_URL, record);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to save attendance");
    }
  }
);

export const getAttendanceHistory = createAsyncThunk(
  "attendance/history",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(API_URL);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch history");
    }
  }
);

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    resetAttendance: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(markAttendance.pending, (state) => { state.loading = true; })
      .addCase(markAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.history.push(action.payload);
      })
      .addCase(markAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getAttendanceHistory.fulfilled, (state, action) => {
        state.history = action.payload;
      });
  },
});

export const { resetAttendance } = attendanceSlice.actions;
export default attendanceSlice.reducer;