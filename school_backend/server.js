const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const staffRoutes = require('./routes/staffRoutes');
const feeRoutes = require('./routes/feeRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const examRoutes = require('./routes/examRoutes');
const resultRoutes = require('./routes/resultRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const userRoutes = require('./routes/userRoutes');
const feeStructureRoutes = require('./routes/feeStructureRoutes');

dotenv.config();
const app = express();

// 1. Global CORS
app.use(cors());
app.use(express.json());

// 2. Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/fee-structure', feeStructureRoutes);

// 3. STATIC FOLDER - WITH EXPLICIT CORS HEADERS
// This is the critical fix for the PDF "PHOTO" issue.
app.use('/uploads', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
}, express.static(path.join(__dirname, '/uploads')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));