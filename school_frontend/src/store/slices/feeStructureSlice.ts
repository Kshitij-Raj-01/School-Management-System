import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/fee-structure`;

export interface FeeStructure {
  classname: string;
  monthlyFee: number;
  annualFee: number;
  examFee: number;
  otherFee: number;
  fine: number;
  busFee: number;
}

interface FeeStructureState {
  structure: FeeStructure[];
  loading: boolean;
  error: string | null;
}

const initialState: FeeStructureState = {
  structure: [],
  loading: false,
  error: null,
};

// --- ACTIONS ---
export const fetchFeeStructure = createAsyncThunk(
  "feeStructure/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(API_URL);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch structure");
    }
  }
);

export const saveFeeStructureDB = createAsyncThunk(
  "feeStructure/save",
  async (structure: FeeStructure[], { rejectWithValue }) => {
    try {
      const { data } = await axios.post(API_URL, structure);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to save structure");
    }
  }
);

const feeStructureSlice = createSlice({
  name: "feeStructure",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeeStructure.pending, (state) => { state.loading = true; })
      .addCase(fetchFeeStructure.fulfilled, (state, action) => { 
        state.loading = false; 
        state.structure = action.payload; 
      })
      .addCase(fetchFeeStructure.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload as string; 
      });
  },
});

export default feeStructureSlice.reducer;