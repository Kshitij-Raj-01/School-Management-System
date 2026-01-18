import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/results`;

export interface ExamResult {
  _id?: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  classname: string;
  examName: string;
  academicYear: string;
  subject: string;
  marksObtained: number;
  totalMarks: number;
  grade: string;
  remarks?: string;
}

interface ResultState {
  results: ExamResult[];
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: ResultState = {
  results: [],
  loading: false,
  error: null,
  success: false,
};

// Fetch Results (accepts filters object)
export const fetchResults = createAsyncThunk(
  "results/fetch",
  async (filters: { studentId?: string; classname?: string; examName?: string; academicYear?: string } = {}, { rejectWithValue }) => {
    try {
      // Build query string
      const params = new URLSearchParams(filters as any).toString();
      const { data } = await axios.get(`${API_URL}?${params}`);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch results");
    }
  }
);

export const addResult = createAsyncThunk(
  "results/add",
  async (result: ExamResult, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(API_URL, result);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to add result");
    }
  }
);

const resultSlice = createSlice({
  name: "results",
  initialState,
  reducers: {
    resetResultState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchResults.pending, (state) => { state.loading = true; })
      .addCase(fetchResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(addResult.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Check if exists to update, else push
        const index = state.results.findIndex(r => 
            r.studentId === action.payload.studentId && 
            r.examName === action.payload.examName &&
            r.academicYear === action.payload.academicYear && 
            r.subject === action.payload.subject
        );
        if (index >= 0) {
            state.results[index] = action.payload;
        } else {
            state.results.push(action.payload);
        }
      });
  },
});

export const { resetResultState } = resultSlice.actions;
export default resultSlice.reducer;