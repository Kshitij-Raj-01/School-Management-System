import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/teachers`;

export interface Teacher {
  _id?: string;
  teacher_name: string;
  email: string;
  aadhar_no?: string;
  pan_no?: string;
  address: string;
  gender: string;
  contact_no: string;
  qualification: string;
  subjectsToTeach: string[];
  classTeacherOf?: string;
  previous_school?: string;
  dob?: string; // <--- NEW FIELD ADDED
  age: string;
  estimated_salary: string;
  image: string;
  joining_date?: string;
}

interface TeacherState {
  teachers: Teacher[];
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: TeacherState = {
  teachers: [],
  loading: false,
  error: null,
  success: false,
};

// --- API ACTIONS ---

export const listTeachers = createAsyncThunk(
  "teacher/list",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(API_URL);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch teachers");
    }
  }
);

export const registerTeacher = createAsyncThunk(
  "teacher/register",
  async (teacherData: Teacher, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(API_URL, teacherData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to register teacher");
    }
  }
);

export const updateTeacher = createAsyncThunk(
  "teacher/update",
  async (teacherData: Teacher, { rejectWithValue }) => {
    try {
      // NOTE: You need to implement PUT /api/teachers/:id in backend if you want this to work fully
      // For now, we reuse the pattern
      const { data } = await axios.put(`${API_URL}/${teacherData._id}`, teacherData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update teacher");
    }
  }
);

export const deleteTeacher = createAsyncThunk(
  "teacher/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete teacher");
    }
  }
);

const teacherSlice = createSlice({
  name: "teacher",
  initialState,
  reducers: {
    resetTeacherState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerTeacher.pending, (state) => { state.loading = true; })
      .addCase(registerTeacher.fulfilled, (state) => { state.loading = false; state.success = true; })
      .addCase(registerTeacher.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      // List
      .addCase(listTeachers.pending, (state) => { state.loading = true; })
      .addCase(listTeachers.fulfilled, (state, action) => { state.loading = false; state.teachers = action.payload; })
      .addCase(listTeachers.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      // Delete
      .addCase(deleteTeacher.fulfilled, (state, action) => {
        state.loading = false;
        state.teachers = state.teachers.filter((t) => t._id !== action.payload);
      });
  },
});

export const { resetTeacherState } = teacherSlice.actions;
export default teacherSlice.reducer;