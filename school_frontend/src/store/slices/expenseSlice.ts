import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/expenses`;

export interface Expense {
  _id?: string;
  title: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface ExpenseState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
}

const initialState: ExpenseState = {
  expenses: [],
  loading: false,
  error: null,
};

export const fetchExpenses = createAsyncThunk("expenses/fetch", async () => {
  const { data } = await axios.get(API_URL);
  return data;
});

export const addExpense = createAsyncThunk("expenses/add", async (expense: Expense) => {
  const { data } = await axios.post(API_URL, expense);
  return data;
});

export const deleteExpense = createAsyncThunk("expenses/delete", async (id: string) => {
  await axios.delete(`${API_URL}/${id}`);
  return id;
});

const expenseSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.fulfilled, (state, action) => { state.expenses = action.payload; })
      .addCase(addExpense.fulfilled, (state, action) => { state.expenses.unshift(action.payload); })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter(e => e._id !== action.payload);
      });
  },
});

export default expenseSlice.reducer;