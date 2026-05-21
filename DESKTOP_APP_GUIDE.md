# Compliance Tracker - Desktop Application Guide

## Current Status

### ✅ Web Application - FULLY FUNCTIONAL
- **URL**: http://localhost:3000
- **Status**: All features working perfectly
- **Notifications**: Browser notifications working
- **Data**: Projects, tasks, statistics all displaying correctly

### ⚠️ Desktop Application - PARTIAL FUNCTIONALITY
- **Status**: Authentication working, UI loading, but data not displaying
- **Issue**: API calls may be failing silently
- **Recommendation**: Use web application until desktop app is fully debugged

## Recommended Setup: Web Application

### Starting the Application

1. **Start Docker Backend**:
   ```bash
   cd Compliance-Tracker-Notifier
   docker-compose up -d
   ```

2. **Access Web App**:
   - Open browser: http://localhost:3000
   - Login with credentials (see below)

3. **Enable Browser Notifications**:
   - Click "Allow" when prompted for notifications
   - Notifications will appear at scheduled times (8:30 AM, 9:30 AM)

### Test Credentials

```
Username: admin
Password: Admin123

OR

Username: aarav
Password: Password123

OR

Username: priya
Password: Password123
```

## Notification System

### Scheduled Notifications

The system sends notifications at:
- **8:30 AM**: Daily summary + Tasks due today
- **9:30 AM**: Overdue tasks reminder
- **Monday 8:30 AM**: Weekly upcoming tasks

### Notification Features

1. **Browser Notifications**: System-level popups
2. **In-App Toasts**: Notifications within the application
3. **Once-Per-Day Tracking**: Each task notified only once per day
4. **Automatic Reset**: Tracking resets at midnight

### Testing Notifications

1. **Manual Test**:
   - Go to Dashboard
   - Click "Show Sample Popup" button
   - See notification toast appear

2. **Scheduled Test**:
   - Add tasks with due dates
   - Wait for scheduled time (8:30 AM or 9:30 AM)
   - Receive automatic notifications

## Features

### Authentication
- ✅ Login with username or email
- ✅ Password visibility toggle
- ✅ Registration
- ✅ Forgot password
- ✅ Reset password with token
- ✅ Auto-login persistence

### Project Management
- ✅ Create projects
- ✅ Import tasks from Excel
- ✅ View project details
- ✅ Track project status

### Task Management
- ✅ View all tasks
- ✅ Filter by status (pending, completed, overdue)
- ✅ Update task status
- ✅ Mark tasks complete
- ✅ Track due dates

### Dashboard
- ✅ Project statistics
- ✅ Task counts by status
- ✅ Upcoming tasks
- ✅ Overdue tasks
- ✅ Recent projects

### Notifications
- ✅ Scheduled notifications
- ✅ Browser notifications
- ✅ In-app toasts
- ✅ Once-per-day tracking
- ✅ Automatic midnight reset

## Desktop Application (Troubleshooting)

### Known Issues

1. **Empty Dashboard**: Data not loading from backend
2. **Blank Projects Page**: API calls may be failing

### Debugging Steps

If you want to debug the desktop app:

1. **Launch with DevTools**:
   ```
   Compliance-Tracker-Notifier\dist-electron\win-unpacked\Compliance Tracker.exe
   ```

2. **Check Console Tab**:
   - Look for "Loading dashboard data..." message
   - Check for error messages
   - Look for failed API calls

3. **Check Network Tab**:
   - Look for requests to `localhost:8000`
   - Check if requests are red (failed) or green (success)
   - Verify response data

4. **Test Backend Connection**:
   In Console tab, run:
   ```javascript
   fetch('http://localhost:8000/api/dashboard/stats')
     .then(r => r.json())
     .then(console.log)
   ```

### Possible Causes

1. **CORS Issues**: Desktop app may have CORS restrictions
2. **Authentication Token**: Token may not be sent with requests
3. **API URL**: May be using wrong base URL
4. **Error Handling**: Errors may be caught silently

## Pushing Changes to GitHub

### Files Modified

All changes are in the `Compliance-Tracker-Notifier` directory:

```
Compliance-Tracker-Notifier/
├── backend/
│   ├── server.py (added /health endpoint, demo users)
│   ├── auth_service.py (authentication system)
│   ├── auth_schemas.py (auth data models)
│   ├── auth_utils.py (JWT utilities)
│   ├── models.py (added User model)
│   └── notification_scheduler.py (updated schedules, once-per-day tracking)
├── frontend/
│   ├── src/
│   │   ├── api.ts (added Electron detection, auth endpoints)
│   │   ├── App.tsx (added auth routing)
│   │   ├── App.css (added auth styles)
│   │   └── components/
│   │       ├── Dashboard.tsx (removed toggle, added logging)
│   │       ├── LoginPage.tsx (created)
│   │       ├── RegistrationPage.tsx (created)
│   │       ├── ForgotPasswordPage.tsx (created)
│   │       └── ResetPasswordPage.tsx (created)
│   └── vite.config.ts (added base: './')
├── electron/
│   └── main.js (fixed paths, added DevTools, backend health check)
└── package.json (added asarUnpack, removed Python from build)
```

### Git Commands

```bash
cd Compliance-Tracker-Notifier

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "Add authentication system, password reset, and notification improvements

- Implemented full authentication system with JWT
- Added login, registration, forgot/reset password pages
- Updated notification scheduler (8:30 AM, 9:30 AM)
- Added once-per-day notification tracking
- Fixed desktop app ICU data issues
- Added backend health endpoint
- Improved error handling and logging"

# Push to GitHub
git push origin main
```

## Recommendation

**Use the Web Application** (http://localhost:3000) for:
- ✅ Reliable data display
- ✅ Full feature functionality
- ✅ Browser notifications
- ✅ Easier debugging
- ✅ Better performance

The web application is production-ready and fully functional. The desktop app requires additional debugging to resolve the data loading issue.

## Support

For issues or questions:
1. Check browser console for errors
2. Verify Docker containers are running: `docker ps`
3. Test backend health: `curl http://localhost:8000/health`
4. Check notification permissions in browser settings

---

**Made with Bob** 🤖