import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/staff`;

export interface Staff {
  _id?: string;
  staff_name: string;
  email: string;
  aadhar_no?: string;
  pan_no?: string;
  address: string;
  work: string; // Role/Designation (e.g. Driver, Clerk)
  gender: string;
  contact_no: string;
  qualification: string;
  previous_school?: string;
  dob?: string; // <--- NEW FIELD
  age: string;
  salary: string;
  image: string;
  joining_date?: string;
}

interface StaffState {
  staffList: Staff[];
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: StaffState = {
  staffList: [],
  loading: false,
  error: null,
  success: false,
};

// --- API ACTIONS ---

export const listStaff = createAsyncThunk(
  "staff/list",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(API_URL);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch staff list");
    }
  }
);

export const registerStaff = createAsyncThunk(
  "staff/register",
  async (staffData: Staff, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(API_URL, staffData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to register staff");
    }
  }
);

export const updateStaff = createAsyncThunk(
  "staff/update",
  async (staffData: Staff, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(`${API_URL}/${staffData._id}`, staffData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update staff");
    }
  }
);

export const deleteStaff = createAsyncThunk(
  "staff/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete staff");
    }
  }
);

const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    resetStaffState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerStaff.pending, (state) => { state.loading = true; })
      .addCase(registerStaff.fulfilled, (state) => { state.loading = false; state.success = true; })
      .addCase(registerStaff.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      // List
      .addCase(listStaff.pending, (state) => { state.loading = true; })
      .addCase(listStaff.fulfilled, (state, action) => { state.loading = false; state.staffList = action.payload; })
      .addCase(listStaff.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      // Delete
      .addCase(deleteStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.staffList = state.staffList.filter((t) => t._id !== action.payload);
      });
  },
});

export const { resetStaffState } = staffSlice.actions;
export default staffSlice.reducer;