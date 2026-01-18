import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/students`;

export interface Student {
  _id?: string;
  admission_no: string;
  roll_no?: string;
  student_name: string;
  classname: string;
  address: string;
  contact_no: string;
  gender: string;
  dob?: string;
  age: string;
  email: string;
  registration_fees: string;
  image: string;
  usesBus?: boolean;
  pan_no?: string;
  weight?: string;
  height?: string;
  aadhar_no?: string;
  previous_school_name?: string;
  alternate_mobile_no?: string;
  father_name?: string;
  father_aadhar_no?: string;
  mother_name?: string;
  mother_aadhar_no?: string;
}

interface StudentState {
  students: Student[];
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: StudentState = {
  students: [],
  loading: false,
  error: null,
  success: false,
};

// --- REGISTER ---
export const registerStudent = createAsyncThunk(
  "student/register",
  async (studentData: Student, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(API_URL, studentData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to register student");
    }
  }
);

// --- UPDATE ---
export const updateStudent = createAsyncThunk(
  "student/update",
  async (studentData: Student, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(`${API_URL}/${studentData._id}`, studentData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update student");
    }
  }
);

// --- DELETE ---
export const deleteStudent = createAsyncThunk(
  "student/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete student");
    }
  }
);

// --- LIST ---
export const listStudents = createAsyncThunk(
  "student/list",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(API_URL);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch students");
    }
  }
);

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    resetStudentState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerStudent.pending, (state) => { state.loading = true; })
      .addCase(registerStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.students.push(action.payload); // Add new student to list instantly
      })
      .addCase(registerStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update
      .addCase(updateStudent.pending, (state) => { state.loading = true; })
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // INSTANTLY UPDATE THE STUDENT IN THE LIST
        const index = state.students.findIndex(s => s._id === action.payload._id);
        if (index !== -1) {
          state.students[index] = action.payload;
        }
      })
      .addCase(updateStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.students = state.students.filter((t) => t._id !== action.payload);
      })
      // List
      .addCase(listStudents.pending, (state) => { state.loading = true; })
      .addCase(listStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload;
      })
      .addCase(listStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetStudentState } = studentSlice.actions;
export default studentSlice.reducer;