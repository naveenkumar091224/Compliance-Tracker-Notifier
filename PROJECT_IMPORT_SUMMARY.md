# Compliance Tracker Notifier - Import Summary

**Import Date:** 2026-05-20  
**Source Repository:** https://github.com/naveenkumar091224/Compliance-Tracker-Notifier.git  
**Local Directory:** `c:/Users/PavitraMungara/.docker/bob-demo/compliance-tracker-notifier`

---

## 📋 Project Overview

The **Compliance Tracker Notifier** is a comprehensive web application designed for managing compliance tasks across multiple projects with Excel import/export functionality. It provides a centralized system for tracking compliance activities, deadlines, and task completion status.

### Key Features

✅ **Multi-Project Management**
- Create, update, and delete projects dynamically
- No limit on number of projects
- Each project has its own task tracking

✅ **Excel Import/Export**
- Import SPL 2.1 DS&P Activity Tracker Excel files (.xlsx, .xlsm)
- Automatic control template creation
- Task instance generation for recurring tasks
- Support for Monthly, Quarterly, Annual, and Ongoing frequencies

✅ **Dashboard & Analytics**
- Portfolio overview with statistics
- Tasks due today, this week, and overdue tracking
- Project-specific task views
- Completion tracking

✅ **Task Management**
- Track planned vs actual completion dates
- Mark tasks as complete
- Filter by status (pending, completed)
- Evidence location tracking

---

## 🏗️ Technology Stack

### Backend
- **Python 3.11** with FastAPI
- **SQLAlchemy** ORM for database operations
- **SQLite** database for data persistence
- **OpenPyXL** for Excel file processing
- **Uvicorn** ASGI server

### Frontend
- **React 18** with TypeScript
- **Vite** build tool for fast development
- **React Router** for navigation
- **Axios** for API communication

### DevOps
- **Docker** containerization
- **Docker Compose** for orchestration
- Hot reload enabled for development

---

## 📁 Project Structure

```
compliance-tracker-notifier/
├── backend/
│   ├── db.py                  # Database connection and session management
│   ├── models.py              # SQLAlchemy database models
│   ├── schemas.py             # Pydantic schemas for validation
│   ├── server.py              # FastAPI application and routes
│   ├── excel_service.py       # Excel import/export logic
│   ├── requirements.txt       # Python dependencies
│   └── Dockerfile             # Backend container configuration
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatbotWidget.tsx    # AI chatbot interface
│   │   │   ├── Dashboard.tsx        # Main dashboard view
│   │   │   ├── ProjectList.tsx      # Projects listing
│   │   │   └── ProjectDetail.tsx    # Individual project view
│   │   ├── api.ts             # API client configuration
│   │   ├── types.ts           # TypeScript type definitions
│   │   ├── App.tsx            # Main application component
│   │   ├── App.css            # Application styles
│   │   └── main.tsx           # Application entry point
│   ├── package.json           # Node.js dependencies
│   ├── vite.config.ts         # Vite configuration
│   └── Dockerfile             # Frontend container configuration
│
├── docker-compose.yml         # Multi-container orchestration
├── README.md                  # Comprehensive documentation
├── QUICK_START.md            # Quick start guide
└── .gitignore                # Git ignore rules
```

---

## 🔧 Dependencies

### Backend Dependencies (requirements.txt)
```
fastapi==0.104.1              # Modern web framework
uvicorn[standard]==0.24.0     # ASGI server
sqlalchemy==2.0.23            # ORM for database operations
pydantic==2.5.0               # Data validation
python-multipart==0.0.6       # File upload support
openpyxl==3.1.2               # Excel file processing
python-dateutil==2.8.2        # Date parsing utilities
```

### Frontend Dependencies (package.json)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}
```

---

## 🚀 Quick Start Instructions

### Prerequisites
- Docker and Docker Compose installed
- Git (already used for cloning)

### Starting the Application

1. **Navigate to the project directory:**
   ```bash
   cd compliance-tracker-notifier
   ```

2. **Start with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - **Frontend UI:** http://localhost:3000
   - **Backend API:** http://localhost:8000
   - **API Documentation:** http://localhost:8000/docs

4. **Stop the application:**
   ```bash
   docker-compose down
   ```

### Alternative: Local Development

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn server:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 📊 Database Schema

### Core Tables

1. **Projects**
   - Stores project information
   - Fields: name, code, description, start_date, client
   - Links to project controls and tasks

2. **Control Templates**
   - Master library of all controls
   - Reusable across multiple projects
   - Contains control objectives and execution tasks

3. **Project Controls**
   - Maps which controls apply to which projects
   - Tracks applicability status
   - Links projects to control templates

4. **Task Instances**
   - Individual task occurrences
   - Tracks planned vs actual completion dates
   - Status tracking (pending/completed)
   - Frequency-based instance generation

---

## 🔌 API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project
- `POST /api/projects/{id}/import-excel` - Import Excel file

### Tasks
- `GET /api/projects/{id}/tasks` - Get project tasks
- `GET /api/tasks` - Get all tasks
- `PUT /api/tasks/{id}` - Update task
- `POST /api/tasks/{id}/complete` - Mark task complete

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Control Templates
- `GET /api/control-templates` - List all control templates

---

## 📝 Excel File Format

The application expects Excel files with the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| Control Objective | High-level control goal | "Review risk log with management" |
| Control Execution Tasks | Detailed task description | "On a scheduled basis, review..." |
| Control Guidance | Reference code | "RSK 3.1" |
| Frequency - Event Driven | Trigger conditions | "When there is a change..." |
| Frequency - Scheduled | Regular schedule | "Monthly", "Quarterly", "Annually" |
| Planned Completion Date | Target deadline | "15-Feb-26" |
| Actual Completion Date | When completed | "6-Feb-26" |
| Assigned to | Team members | "DPE, PM, SE" |
| Evidence storage location | Where proof is stored | "IBM OneDrive" |

---

## 🎯 Usage Workflow

1. **Create a Project**
   - Navigate to Projects page
   - Click "+ New Project"
   - Fill in project details
   - Click "Create Project"

2. **Upload Excel File**
   - Select project card
   - Choose Excel file
   - Click "📤 Upload Excel"
   - Wait for import completion

3. **View Tasks**
   - Click on project name
   - View all tasks with instance labels
   - Filter by status (All/Pending/Completed)

4. **Complete Tasks**
   - Find pending task
   - Click "✓ Complete" button
   - Task marked with current date

5. **Monitor Dashboard**
   - View portfolio statistics
   - Track tasks due today/this week
   - Monitor overdue tasks

---

## 🔍 Key Components

### Backend Components

1. **models.py** - Database models using SQLAlchemy
2. **schemas.py** - Pydantic models for request/response validation
3. **server.py** - FastAPI routes and application logic
4. **excel_service.py** - Excel parsing and task generation
5. **db.py** - Database connection and session management

### Frontend Components

1. **Dashboard.tsx** - Portfolio overview and statistics
2. **ProjectList.tsx** - Project management interface
3. **ProjectDetail.tsx** - Individual project task view
4. **ChatbotWidget.tsx** - AI assistant interface
5. **api.ts** - Centralized API client

---

## 🐳 Docker Configuration

### Services

1. **Backend Service**
   - Port: 8000
   - Volume: ./backend:/app
   - Database: SQLite with persistent volume
   - Network: compliance-network

2. **Frontend Service**
   - Port: 3000
   - Volume: ./frontend:/app
   - Depends on: backend
   - Network: compliance-network

### Volumes
- `backend-data` - Persistent database storage

---

## 🛠️ Troubleshooting

### Port Conflicts
If ports 3000 or 8000 are in use:
- Modify `docker-compose.yml`
- Change port mappings (e.g., "3001:3000")

### Excel Import Issues
- Verify Excel file format matches expected columns
- Check date format (DD-MMM-YY)
- Ensure all required columns are present

### Database Reset
```bash
docker-compose down
rm backend/compliance_tracker.db
docker-compose up --build
```

---

## 🚧 Future Enhancements

- [ ] Email notifications for upcoming deadlines
- [ ] Desktop notification agent
- [ ] Slack integration
- [ ] Advanced reporting and analytics
- [ ] Bulk task operations
- [ ] Task comments and notes
- [ ] File attachments for evidence
- [ ] User authentication and roles
- [ ] Mobile responsive improvements
- [ ] Export to Excel functionality

---

## 📚 Additional Documentation

- **README.md** - Comprehensive project documentation
- **QUICK_START.md** - Quick start guide for new users

---

## ✅ Import Status

- ✅ Repository cloned successfully
- ✅ Project structure verified
- ✅ Dependencies documented
- ✅ Docker configuration present
- ✅ Documentation available
- ✅ Ready for deployment

---

## 🎉 Next Steps

1. Review the project structure and code
2. Install dependencies if running locally
3. Start the application using Docker Compose
4. Create your first project
5. Import Excel files and start tracking compliance tasks

---

**Project successfully imported and ready for use!**