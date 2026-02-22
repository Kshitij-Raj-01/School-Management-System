# School Management System

A comprehensive, full-stack web application for managing school operations, student records, staff management, attendance tracking, grades, and administrative tasks. Built with TypeScript for type safety and reliability.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

School Management System is an enterprise-grade solution designed to streamline school operations and administrative processes. It provides a centralized platform for managing student information, staff records, attendance, grades, classes, and various school-related administrative tasks.

### Key Objectives
- **Efficient Administration**: Automate school administrative workflows
- **Student Management**: Maintain comprehensive student records and academic progress
- **Attendance Tracking**: Digital attendance management system
- **Grade Management**: Transparent grading and academic performance tracking
- **Staff Management**: Employee records and staff information management
- **Report Generation**: Automated reports for parents and administrators

## ✨ Features

### Student Management
- ✅ Complete student profile management
- ✅ Enrollment and registration system
- ✅ Student academic history tracking
- ✅ Guardian/Parent information management
- ✅ Fee and payment records

### Attendance System
- ✅ Daily attendance marking
- ✅ Real-time attendance reports
- ✅ Attendance analytics and trends
- ✅ Absence notifications
- ✅ Bulk attendance operations

### Academic Management
- ✅ Grade and marks management
- ✅ Class and section management
- ✅ Subject assignment and management
- ✅ Exam scheduling and result publication
- ✅ Academic performance analytics
- ✅ Report cards generation

### Staff Management
- ✅ Employee records and profiles
- ✅ Salary and payroll management
- ✅ Staff allocation and scheduling
- ✅ Staff leave management
- ✅ Performance tracking

### Administrative Features
- ✅ User authentication and authorization (Role-based Access Control)
- ✅ Dashboard with key metrics and analytics
- ✅ Notification system
- ✅ Multi-user support with different permission levels
- ✅ Data export and reporting capabilities
- ✅ System audit logs

## 🛠️ Tech Stack

### Frontend
- **TypeScript** (92.8%) - Primary language for type-safe development
- **JavaScript** (6.4%) - Complementary scripting
- **React** - UI library for interactive interfaces
- **Redux/Context API** - State management
- **Axios** - HTTP client for API communication
- **Tailwind CSS / Material-UI** - Styling and UI components

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type safety and better development experience
- **REST API** - API architecture pattern
- **JWT** - Authentication and authorization

### Database
- **MySQL** - Relational database for data persistence
- **SQL** - Database queries and operations

### Development Tools
- **npm/yarn** - Package management
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control

## 📁 Project Structure

```
School-Management-System/
├── school_frontend/              # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/           # Reusable React components
│   │   ├── pages/                # Page components
│   │   ├── services/             # API service calls
│   │   ├── store/                # State management
│   │   ├── styles/               # Global styles
│   │   ├── utils/                # Utility functions
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── school_backend/               # Express backend application
│   ├── src/
│   │   ├── controllers/          # Request handlers
│   │   ├── models/               # Database models
│   │   ├── routes/               # API routes
│   │   ├── middleware/           # Custom middleware
│   │   ├── config/               # Configuration files
│   │   ├── utils/                # Utility functions
│   │   ├── validators/           # Input validation
│   │   ├── types/                # TypeScript type definitions
│   │   └── index.ts              # Application entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── .gitignore
│
├── SQL Command.txt               # Database initialization scripts
├── .anima/                       # Design and animation assets
├── README.md                     # Project documentation
└── .gitignore

```

## 💻 Installation & Setup

### Prerequisites
- **Node.js** (v14.0.0 or higher)
- **npm** or **yarn** package manager
- **MySQL** (v5.7 or higher)
- **Git** version control

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd school_backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment configuration:**
```bash
cp .env.example .env
```

4. **Configure environment variables** (update .env file):
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=school_management_db
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
```

5. **Initialize the database:**
```bash
mysql -u [username] -p [database_name] < ../SQL Command.txt
```

6. **Start the backend server:**
```bash
npm start
# For development with auto-reload:
npm run dev
```

Backend will run on: `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd school_frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment configuration:**
```bash
cp .env.example .env
```

4. **Configure environment variables** (update .env file):
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

5. **Start the development server:**
```bash
npm start
```

Frontend will run on: `http://localhost:3000`

## ⚙️ Configuration

### Database Configuration

The database initialization script is provided in `SQL Command.txt`. This includes:
- User and authentication tables
- Student management tables
- Attendance tracking tables
- Grade and academic performance tables
- Staff and payroll tables
- Administrative tables

### JWT Configuration

Update the JWT secret in your backend `.env` file:
```
JWT_SECRET=your_secure_secret_key_min_32_characters
JWT_EXPIRE=7d
```

### CORS Configuration

Update backend CORS settings to allow frontend communication:
```typescript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
};
```

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd school_backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd school_frontend
npm start
```

### Production Mode

**Build Frontend:**
```bash
cd school_frontend
npm run build
```

**Run Backend:**
```bash
cd school_backend
NODE_ENV=production npm start
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh JWT token

### Student Endpoints
- `GET /students` - Get all students
- `GET /students/:id` - Get student by ID
- `POST /students` - Create new student
- `PUT /students/:id` - Update student
- `DELETE /students/:id` - Delete student

### Attendance Endpoints
- `GET /attendance` - Get attendance records
- `POST /attendance` - Mark attendance
- `GET /attendance/:studentId` - Get student attendance
- `PUT /attendance/:id` - Update attendance record

### Grade Endpoints
- `GET /grades` - Get all grades
- `POST /grades` - Submit grades
- `GET /grades/:studentId` - Get student grades
- `PUT /grades/:id` - Update grade

### Staff Endpoints
- `GET /staff` - Get all staff members
- `POST /staff` - Add new staff member
- `PUT /staff/:id` - Update staff information
- `DELETE /staff/:id` - Remove staff member

### Class Endpoints
- `GET /classes` - Get all classes
- `POST /classes` - Create new class
- `PUT /classes/:id` - Update class
- `DELETE /classes/:id` - Delete class

## 🗄️ Database Schema

Key tables in the database:
- **users** - User accounts and authentication
- **students** - Student information and profiles
- **staff** - Staff/Employee records
- **classes** - Class/Section information
- **attendance** - Attendance records
- **grades** - Student grades and marks
- **subjects** - Subject information
- **fees** - Student fee records
- **leaves** - Leave applications

Refer to `SQL Command.txt` for complete schema details.

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository:**
```bash
git clone https://github.com/Kshitij-Raj-01/School-Management-System.git
cd School-Management-System
```

2. **Create a feature branch:**
```bash
git checkout -b feature/your-feature-name
```

3. **Make your changes:**
- Follow the existing code style
- Maintain TypeScript type safety
- Write clear commit messages

4. **Commit your changes:**
```bash
git commit -m "feat: Add your feature description"
```

5. **Push to your fork:**
```bash
git push origin feature/your-feature-name
```

6. **Create a Pull Request** with a clear description of your changes

### Code Standards
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Add comments for complex logic
- Write meaningful commit messages
- Test your changes before submitting PR

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Kshitij Raj**
- GitHub: [@Kshitij-Raj-01](https://github.com/Kshitij-Raj-01)

## 📞 Support & Contact

For issues, feature requests, or questions:
- Open an [GitHub Issue](https://github.com/Kshitij-Raj-01/School-Management-System/issues)
- Create a Discussion in the repository

## 🔒 Security

- All passwords are hashed using bcrypt
- JWT tokens for secure authentication
- Input validation on all API endpoints
- SQL injection prevention with parameterized queries
- CORS enabled for secure cross-origin requests
- Regular security updates recommended

## 📈 Roadmap

- [ ] Mobile application (React Native)
- [ ] Advanced analytics and reporting
- [ ] Integration with payment gateways
- [ ] Email notifications system
- [ ] SMS alerts for attendance
- [ ] Document management system
- [ ] Parent portal enhancements
- [ ] Multi-language support

---

**Note:** This is a comprehensive school management solution. For detailed implementation questions, refer to the code comments and commit history.