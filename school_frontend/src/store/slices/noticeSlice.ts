import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/notices`;

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  targetAudience: string;
  postedBy: string;
  isImportant: boolean;
}

interface NoticeState {
  notices: Notice[];
  loading: boolean;
  error: string | null;
}

const initialState: NoticeState = {
  notices: [],
  loading: false,
  error: null,
};

// --- API ACTIONS ---

export const fetchNotices = createAsyncThunk(
  "notice/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(API_URL);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch notices");
    }
  }
);

export const addNotice = createAsyncThunk(
  "notice/add",
  async (notice: Omit<Notice, "id" | "date">, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(API_URL, notice);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to add notice");
    }
  }
);

export const deleteNotice = createAsyncThunk(
  "notice/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete notice");
    }
  }
);

const noticeSlice = createSlice({
  name: "notice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchNotices.fulfilled, (state, action) => {
        state.notices = action.payload;
      })
      // Add
      .addCase(addNotice.fulfilled, (state, action) => {
        state.notices.unshift(action.payload);
      })
      // Delete
      .addCase(deleteNotice.fulfilled, (state, action) => {
        state.notices = state.notices.filter((n) => n.id !== action.payload);
      });
  },
});

export default noticeSlice.reducer;