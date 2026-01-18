import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/dashboard`;

interface DashboardState {
  stats: {
    students: number;
    teachers: number;
    staff: number;
    totalCollection: number;
  } | null;
  landingContent: any | null; // Replace 'any' with LandingPageContent interface if strict
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  landingContent: null,
  loading: false,
  error: null,
};

// Actions
export const fetchStats = createAsyncThunk("dashboard/stats", async () => {
  const { data } = await axios.get(`${API_URL}/stats`);
  return data;
});

export const fetchLandingContent = createAsyncThunk("dashboard/landing/get", async () => {
  const { data } = await axios.get(`${API_URL}/landing`);
  return data;
});

export const updateLandingContent = createAsyncThunk("dashboard/landing/update", async (content: any) => {
  const { data } = await axios.post(`${API_URL}/landing`, content);
  return data;
});

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchLandingContent.fulfilled, (state, action) => {
        state.landingContent = action.payload;
      })
      .addCase(updateLandingContent.fulfilled, (state, action) => {
        state.landingContent = action.payload.content;
      });
  },
});

export default dashboardSlice.reducer;