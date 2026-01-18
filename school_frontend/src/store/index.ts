import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import studentReducer from './slices/studentSlice';
import teacherReducer from './slices/teacherSlice';
import staffReducer from './slices/staffSlice';
import feeReducer from './slices/feeSlice';
import salaryReducer from './slices/salarySlice';
import noticeReducer from './slices/noticeSlice';
import attendanceReducer from './slices/attendanceSlice';
import timetableReducer from './slices/timetableSlice';
import examReducer from './slices/examSlice';      
import resultReducer from './slices/resultSlice';  
import dashboardReducer from './slices/dashboardSlice'; 
import expenseReducer from './slices/expenseSlice';
import feeStructureReducer from './slices/feeStructureSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    student: studentReducer,
    teacher: teacherReducer,
    staff: staffReducer,
    fees: feeReducer,
    salary: salaryReducer,
    notice: noticeReducer,
    attendance: attendanceReducer,
    timetable: timetableReducer,
    exam: examReducer,
    results: resultReducer,
    dashboard: dashboardReducer,
    expenses: expenseReducer,
    feeStructure: feeStructureReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;