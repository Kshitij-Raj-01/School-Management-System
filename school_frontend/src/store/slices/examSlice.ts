import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/exams`;

// Types
export interface ExamSubject {
  subject: string;
  date: string;
  time: string;
  duration: string;
}

export interface ExamSchedule {
  _id?: string;
  examName: string;
  examDate: string;
  classname: string;
  subjects: ExamSubject[];
  allowStudentDownload: boolean;
}

export interface AdmitCardAccess {
  studentId: string;
  allowed: boolean;
  allowedDate?: string;
}

interface ExamState {
  currentSchedule: ExamSchedule | null;
  accessList: AdmitCardAccess[];
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: ExamState = {
  currentSchedule: null,
  accessList: [],
  loading: false,
  error: null,
  success: false,
};

// --- API ACTIONS ---

// Fetch Schedule (optionally for a specific class)
export const fetchExamSchedule = createAsyncThunk(
  "exam/fetchSchedule",
  async (classname: string | undefined, { rejectWithValue }) => {
    try {
      const url = classname ? `${API_URL}/schedule?classname=${classname}` : `${API_URL}/schedule`;
      const { data } = await axios.get(url);
      return data; // Returns object (if classname provided) or array
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch schedule");
    }
  }
);

// Save Schedule
export const saveExamSchedule = createAsyncThunk(
  "exam/saveSchedule",
  async (schedule: ExamSchedule, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_URL}/schedule`, schedule);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to save schedule");
    }
  }
);

// Fetch Access List
export const fetchAdmitCardAccess = createAsyncThunk(
  "exam/fetchAccess",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_URL}/access`);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch access list");
    }
  }
);

// Toggle Student Access
export const setStudentAccess = createAsyncThunk(
  "exam/setAccess",
  async ({ studentId, allowed }: { studentId: string; allowed: boolean }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_URL}/access`, { studentId, allowed });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update access");
    }
  }
);

// Allow All
export const allowAllStudents = createAsyncThunk(
  "exam/allowAll",
  async (studentIds: string[], { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_URL}/access/all`, { studentIds });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update all");
    }
  }
);

const examSlice = createSlice({
  name: "exam",
  initialState,
  reducers: {
    resetExamState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Schedule
      .addCase(fetchExamSchedule.pending, (state) => { state.loading = true; })
      .addCase(fetchExamSchedule.fulfilled, (state, action) => {
        state.loading = false;
        // If we fetched for a specific class, we get an object. If not, we might get an array.
        // Adjust logic based on how you use it in the UI. 
        // For now, assuming single class fetch maps to currentSchedule.
        if (!Array.isArray(action.payload)) {
            state.currentSchedule = action.payload;
        }
      })
      // Save Schedule
      .addCase(saveExamSchedule.fulfilled, (state, action) => {
        state.success = true;
        state.currentSchedule = action.payload;
      })
      // Fetch Access
      .addCase(fetchAdmitCardAccess.fulfilled, (state, action) => {
        state.accessList = action.payload;
      })
      // Set Access
      .addCase(setStudentAccess.fulfilled, (state, action) => {
        const index = state.accessList.findIndex(a => a.studentId === action.payload.studentId);
        if (index >= 0) {
          state.accessList[index] = action.payload;
        } else {
          state.accessList.push(action.payload);
        }
      })
      // Allow All
      .addCase(allowAllStudents.fulfilled, (state) => {
        state.success = true;
        // Ideally refetch access list here, or optimistic update
      });
  },
});

export const { resetExamState } = examSlice.actions;
export default examSlice.reducer;