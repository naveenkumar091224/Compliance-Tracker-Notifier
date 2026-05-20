# Compliance Tracker Notifier - Application Demo Guide

**Document Type:** Step-by-Step Demo Walkthrough  
**Application:** DS&P Activity Tracker  
**Date:** May 20, 2026  
**Purpose:** Demonstrate all features and capabilities

---

## 📋 Table of Contents

1. [Getting Started](#1-getting-started)
2. [Login Demo](#2-login-demo)
3. [Dashboard Overview](#3-dashboard-overview)
4. [Creating a Project](#4-creating-a-project)
5. [Importing Excel Data](#5-importing-excel-data)
6. [Viewing and Managing Tasks](#6-viewing-and-managing-tasks)
7. [Using the AI Chatbot](#7-using-the-ai-chatbot)
8. [Notification System Demo](#8-notification-system-demo)
9. [Completing Tasks](#9-completing-tasks)
10. [Viewing All Tasks](#10-viewing-all-tasks)
11. [Key Features Summary](#11-key-features-summary)

---

## 1. Getting Started

### Prerequisites
- Application running at http://localhost:3000
- Docker containers are up and running
- Browser (Chrome, Firefox, Edge, or Safari)

### Accessing the Application

**Step 1:** Open your web browser

**Step 2:** Navigate to: `http://localhost:3000`

**Step 3:** You will see the login page

---

## 2. Login Demo

### Login Screen Features

The login page displays:
- **Application Logo**: 📊 icon
- **Title**: "DS&P Activity Tracker"
- **Description**: "Log in to view projects, tasks, and compliance evidence schedules"
- **Email Field**: For user email
- **Password Field**: For password
- **Demo Credentials Box**: Shows the credentials to use

### Demo Login Process

**Step 1:** On the login page, you'll see demo credentials displayed:

```
Demo login
Email: aarav.sharma@company.com
Password: password123
```

**Step 2:** Enter the credentials:
- **Email**: `aarav.sharma@company.com`
- **Password**: `password123`

**Step 3:** Click the **"Log In"** button

**Step 4:** You will be redirected to the Dashboard

### What Happens After Login

- Session is stored in browser localStorage
- User profile appears in navigation bar
- Full access to all features is granted
- Dashboard loads with real-time statistics

---

## 3. Dashboard Overview

### Dashboard Layout

After logging in, you'll see the main dashboard with several sections:

#### A. Hero Section (Top)
- **Title**: "📊 DS&P Activity Dashboard"
- **Description**: "Track active projects, upcoming evidence submissions, and overdue controls from one place"
- **Action Button**: "Manage Projects" - Quick access to projects page

#### B. Statistics Cards (6 Cards)

**Card 1: Projects**
- Shows: Active projects / Total projects
- Example: "3 Active / 5 Total"
- Color: Blue
- Click to: View all projects

**Card 2: Controls**
- Shows: Applicable controls / Total controls
- Example: "45 Applicable / 50 Total"
- Color: Blue
- Click to: View all tasks

**Card 3: Due Today** ⚠️
- Shows: Number of tasks due today
- Example: "3 Tasks"
- Color: Orange (Urgent)
- Click to: Filter tasks due today

**Card 4: This Week**
- Shows: Tasks due in next 7 days
- Example: "12 Tasks"
- Color: Yellow (Warning)
- Click to: Filter tasks this week

**Card 5: Overdue** 🚨
- Shows: Past due tasks
- Example: "5 Tasks"
- Color: Red (Danger)
- Click to: Filter overdue tasks

**Card 6: Completed** ✅
- Shows: Completed tasks count
- Example: "150 Tasks"
- Color: Green (Success)
- Click to: Filter completed tasks

#### C. Upcoming Tasks Section

**Features:**
- Lists next 8 pending tasks
- Shows task timing labels:
  - "Due today"
  - "Due tomorrow"
  - "Due in X day(s)"
  - "X day(s) overdue"
- Displays:
  - Task name
  - Project code
  - Control description
  - Due date
  - Status badge
- Click any task to view project details

**Notification Demo Controls:**
- "Enable Popup Demo" button - Activates notification system
- "Show Sample Popup" button - Manually triggers notifications

#### D. Recent Projects Sidebar

**Features:**
- Shows last 4 projects
- Each project displays:
  - Project name
  - Project code
  - Status badge (active, completed, etc.)
- Click to jump to project details

#### E. Quick Start Guide

**Workflow Steps:**
1. Create a project with client and team details
2. Upload the compliance Excel workbook for that project
3. Review planned tasks and mark evidence completion over time

---

## 4. Creating a Project

### Step-by-Step Project Creation

**Step 1:** Navigate to Projects
- Click "Projects" in the navigation bar
- Or click "Manage Projects" button on dashboard

**Step 2:** Click "+ New Project" Button
- Located at the top of the projects page
- Opens the project creation form

**Step 3:** Fill in Project Information

**Required Fields:**

1. **Project Name**
   - Example: "Project Alpha"
   - Description: Full project name
   - Validation: Cannot be empty

2. **Project Code**
   - Example: "PROJ-001"
   - Description: Unique identifier
   - Validation: Must be unique across all projects

3. **Start Date**
   - Example: "2026-01-01"
   - Description: Project start date
   - Use date picker to select

**Optional Fields:**

4. **Description**
   - Example: "Compliance tracking for Project Alpha initiative"
   - Description: Detailed project description

5. **Client**
   - Example: "Acme Corporation"
   - Description: Client or customer name

**Step 4:** Click "Create Project"

**Step 5:** Confirmation
- Success message appears: "Project created successfully"
- New project card is displayed in the projects list
- Project status is set to "active" by default

### Project Card Display

Each project card shows:
- **Project Name**: Bold, clickable
- **Project Code**: In parentheses
- **Status Badge**: Color-coded (active = blue)
- **Start Date**: When project began
- **Client**: If provided
- **Excel Upload Section**: For importing data
- **Action Buttons**:
  - "View Details" - Opens project detail page
  - "Delete" - Removes project (with confirmation)

---

## 5. Importing Excel Data

### Excel Import Process

**Step 1:** Prepare Your Excel File

Your Excel file should have these columns:
- Control Objective
- Control Execution Tasks
- Control Guidance
- Frequency - Event Driven
- Frequency - Scheduled
- Planned Completion Date
- Actual Completion Date
- Assigned to
- Evidence storage location

**Step 2:** Locate Your Project Card
- Find the project you want to import data into
- Look for the Excel upload section on the card

**Step 3:** Upload Excel File
- Click "Choose File" button
- Browse and select your Excel file (.xlsx or .xlsm)
- File name appears next to button

**Step 4:** Click "📤 Upload Excel"
- File is uploaded to server
- Sheet selection dialog appears

**Step 5:** Select Sheet
- Dialog shows all sheets in the workbook
- Example sheets: "Sheet1", "Controls", "Summary"
- Select the sheet containing compliance data
- Click "Import from Selected Sheet"

**Step 6:** Wait for Import
- Progress indicator shows import is in progress
- Typically takes 5-30 seconds
- Do not close the browser during import

**Step 7:** View Results
- Success message appears with details:
  - "Successfully imported 15 controls and 180 tasks"
  - Number of controls created
  - Number of tasks generated

### What Happens During Import

**1. Control Template Creation**
- System reads each row from Excel
- Creates or reuses control templates
- Stores control objectives and descriptions

**2. Task Instance Generation**

Based on frequency, system creates:

**Monthly Frequency:**
- 12 task instances per year
- Labels: Jan'26, Feb'26, Mar'26, ..., Dec'26
- Due dates: 15th of each month (or as specified)

**Quarterly Frequency:**
- 4 task instances per year
- Labels: Q1'26, Q2'26, Q3'26, Q4'26
- Due dates: End of each quarter

**Annual Frequency:**
- 1 task instance per year
- Label: 2026
- Due date: As specified in Excel

**Ongoing Frequency:**
- 1 continuous task
- Label: Ongoing
- No specific due date

**3. Data Mapping**
- Assigns team members from "Assigned to" column
- Records evidence location
- Sets planned completion dates
- Links tasks to project

---

## 6. Viewing and Managing Tasks

### Project Detail View

**Step 1:** Open Project Details
- Click on project name from projects list
- Or click "View Details" button on project card

**Step 2:** View Project Information

**Header Section Shows:**
- Project name and code
- Status badge
- Start date
- Client name
- Description

**Step 3:** View Task List

**Task Display Includes:**

1. **Instance Label**
   - Examples: "Jan'26", "Q1'26", "2026"
   - Indicates which occurrence of recurring task

2. **Control Title**
   - Example: "Review risk log with management"
   - Main task objective

3. **Control Description**
   - Detailed task instructions
   - What needs to be done

4. **Planned Date**
   - Target completion date
   - Format: MM/DD/YYYY

5. **Status Badge**
   - "pending" (orange) - Not yet completed
   - "completed" (green) - Finished

6. **Control Code**
   - Example: "RSK 3.1"
   - Reference identifier

7. **Frequency**
   - Monthly, Quarterly, Annual, or Ongoing

8. **Assigned To**
   - Team members responsible
   - Example: "DPE, PM, SE"

9. **Evidence Location**
   - Where proof is stored
   - Example: "IBM OneDrive"

### Task Filtering

**Filter Options:**

**All Tasks**
- Shows all tasks (pending and completed)
- Default view

**Pending Tasks**
- Shows only incomplete tasks
- Useful for daily work planning

**Completed Tasks**
- Shows only finished tasks
- Useful for audit and review

**How to Filter:**
1. Click filter button at top of task list
2. Select desired filter
3. Task list updates immediately
4. Count badge shows number of tasks in each category

---

## 7. Using the AI Chatbot

### Chatbot Widget Features

**Location:** Bottom-right corner of screen (floating button)

**Step 1:** Open Chatbot
- Click "Ask Assistant" button
- Chatbot panel slides up from bottom

**Step 2:** Chatbot Interface

**Header:**
- Title: "DS&P Activity Assistant"
- Subtitle: "Demo responses for workflow validation"
- Controls:
  - Minimize button (−)
  - Maximize button (□)
  - Close button (×)

**Quick Prompts:**
Four pre-defined questions:
1. "What is due this week?"
2. "Show overdue tasks"
3. "How do I import Excel?"
4. "Summarize active projects"

**Message Area:**
- Shows conversation history
- User messages on right
- Assistant messages on left
- Typing indicator when assistant is responding

**Input Field:**
- Type custom questions
- "Send" button to submit

### Demo Conversations

**Example 1: Tasks Due This Week**

**User:** "What is due this week?"

**Assistant Response:**
"There are 12 pending task(s) due this week. Next items: PROJ-001 - Review risk log with management; PROJ-002 - Update security documentation; PROJ-001 - Conduct privacy assessment."

**Example 2: Overdue Tasks**

**User:** "Show overdue tasks"

**Assistant Response:**
"There are 5 overdue task(s). Highest priority examples: PROJ-001 - Review risk log with management; PROJ-003 - Complete audit checklist; PROJ-002 - Submit evidence documentation."

**Example 3: Excel Import Help**

**User:** "How do I import Excel?"

**Assistant Response:**
"To import Excel data, open Projects, create or open a project, upload the workbook, choose the correct sheet tab, and start the import. The tracker then generates planned compliance tasks from the selected worksheet."

**Example 4: Project Summary**

**User:** "Summarize active projects"

**Assistant Response:**
"There are 3 recent project(s) visible here: PROJ-001 (active), PROJ-002 (active), PROJ-003 (on-hold), PROJ-004 (completed)."

### Chatbot Controls

**Minimize:**
- Click "−" button
- Collapses to header only
- Click again to restore

**Maximize:**
- Click "□" button
- Expands to full screen
- Click again to restore normal size

**Close:**
- Click "×" button
- Hides chatbot completely
- Click "Ask Assistant" to reopen

---

## 8. Notification System Demo

### Desktop Notification Features

**Step 1:** Enable Notifications
- On Dashboard, locate "Upcoming Tasks" section
- Click "Enable Popup Demo" button
- Button text changes to "Disable Popup Demo"

**Step 2:** Automatic Notifications
- System checks for tasks due within 7 days
- Automatically shows toast notifications
- Displays top 3 upcoming tasks

**Step 3:** Manual Trigger
- Click "Show Sample Popup" button
- Immediately displays notification toasts
- Shows next 3 pending tasks

### Notification Toast Display

**Toast Appearance:**
- **Location**: Top-right corner of screen
- **Animation**: Slides in from right
- **Duration**: Auto-dismisses after 7 seconds
- **Stacking**: Multiple notifications stack vertically

**Toast Content:**
- **Header**: "Reminder" with close button (×)
- **Title**: Task name
- **Body**: 
  - Project code
  - Due date
  - Example: "PROJ-001 · Due 05/25/2026"

**Interaction:**
- Click "×" to dismiss individual notification
- Notifications auto-dismiss after 7 seconds
- New notifications appear at top of stack

---

## 9. Completing Tasks

### Task Completion Process

**Step 1:** Navigate to Project
- Go to Projects page
- Click on project name
- View task list

**Step 2:** Find Pending Task
- Look for tasks with "pending" status (orange badge)
- Review task details
- Confirm it's ready to be marked complete

**Step 3:** Click "✓ Complete" Button
- Located on the right side of each pending task
- Button is green with checkmark icon

**Step 4:** Automatic Updates
- Task status changes to "completed"
- Status badge turns green
- Actual completion date is set to current date/time
- "✓ Complete" button disappears
- Task moves to "Completed" filter

**Step 5:** Verification
- Check that status badge shows "completed"
- Verify actual completion date is displayed
- Task is now in completed tasks list

### What Gets Recorded

When you complete a task:
- **Status**: Changed from "pending" to "completed"
- **Actual Date**: Current timestamp recorded
- **Updated At**: Timestamp of completion action
- **Audit Trail**: Change is logged in database

---

## 10. Viewing All Tasks

### Tasks View Page

**Step 1:** Navigate to Tasks View
- Click on any statistics card on dashboard
- Or use navigation menu

**Step 2:** Page Layout

**Header:**
- Dynamic title based on active filter
- "Back to Dashboard" button

**Filter Buttons with Counts:**
- **All Tasks (180)** - All tasks across all projects
- **Due Today (3)** - Tasks with today's due date
- **This Week (12)** - Tasks due in next 7 days
- **Overdue (5)** - Past due tasks
- **Completed (150)** - Finished tasks

**Step 3:** Filter Tasks

**Click any filter button:**
- Task list updates immediately
- Count badge shows number of tasks
- Active filter is highlighted

**Step 4:** View Task Details

Each task shows:
- Task name and description
- Project code
- Due date with timing label
- Control code and frequency
- Assigned team members
- Status badge
- Click to view project details

### Filter Examples

**Due Today Filter:**
- Shows only tasks with planned_date = today
- Useful for daily work planning
- Example: 3 tasks due today

**This Week Filter:**
- Shows tasks due in next 7 days
- Useful for weekly planning
- Example: 12 tasks this week

**Overdue Filter:**
- Shows tasks past their due date
- Urgent attention required
- Example: 5 overdue tasks

**Completed Filter:**
- Shows all finished tasks
- Useful for reporting and audit
- Example: 150 completed tasks

---

## 11. Key Features Summary

### Feature 1: Multi-Project Management
✅ Create unlimited projects  
✅ Unique project codes  
✅ Status tracking (active, on-hold, completed, archived)  
✅ Client and team assignment  
✅ Project lifecycle management

### Feature 2: Excel Import
✅ SPL 2.1 format support  
✅ Multi-sheet workbook handling  
✅ Automatic control template creation  
✅ Task instance generation by frequency  
✅ Data validation and error handling

### Feature 3: Task Management
✅ Planned vs actual date tracking  
✅ One-click task completion  
✅ Status filtering (all, pending, completed)  
✅ Evidence location tracking  
✅ Team assignment tracking

### Feature 4: Dashboard Analytics
✅ Real-time statistics (6 metrics)  
✅ Upcoming tasks list  
✅ Recent projects quick access  
✅ Visual status indicators  
✅ Clickable cards for filtering

### Feature 5: AI Chatbot
✅ Context-aware responses  
✅ Quick prompt buttons  
✅ Minimize/maximize controls  
✅ Typing indicator  
✅ Demo mode for validation

### Feature 6: Notifications
✅ Desktop toast notifications  
✅ Configurable enable/disable  
✅ Manual trigger for testing  
✅ Auto-dismiss after 7 seconds  
✅ Stacked notification display

### Feature 7: User Interface
✅ Modern, clean design  
✅ Color-coded status badges  
✅ Responsive layout  
✅ Intuitive navigation  
✅ Loading and empty states

---

## 📊 Demo Scenarios

### Scenario 1: New Project Setup (5 minutes)
1. Login to application
2. Create new project "Project Alpha"
3. Upload Excel file with 15 controls
4. View generated 180 tasks
5. Review dashboard statistics

### Scenario 2: Daily Task Management (3 minutes)
1. Check dashboard for tasks due today
2. Navigate to project with pending tasks
3. Review task details
4. Complete 3 tasks
5. Verify completion in dashboard

### Scenario 3: Weekly Planning (5 minutes)
1. View "This Week" filter on dashboard
2. Review all tasks due in next 7 days
3. Use chatbot to get weekly summary
4. Check for overdue tasks
5. Plan task completion schedule

### Scenario 4: Reporting and Audit (3 minutes)
1. Navigate to "Completed" tasks filter
2. Review completion dates
3. Check evidence locations
4. Export data (future feature)
5. Generate compliance report

---

## 🎯 Success Metrics

After completing this demo, you should be able to:

✅ Login to the application  
✅ Navigate the dashboard  
✅ Create new projects  
✅ Import Excel files  
✅ View and filter tasks  
✅ Complete tasks  
✅ Use the AI chatbot  
✅ Enable notifications  
✅ Understand all key features

---

## 📝 Additional Resources

### Documentation Files
- **README.md** - Complete user guide
- **PROJECT_IMPORT_SUMMARY.md** - Technical documentation
- **QUICK_START.md** - Quick reference guide

### API Documentation
- **Swagger UI**: http://localhost:8000/docs
- Interactive API testing
- Request/response examples

### Support
- Check troubleshooting section in README.md
- Review error messages in browser console
- Restart Docker containers if needed

---

## 🔄 Converting This Document to Word

### Method 1: Microsoft Word
1. Open Microsoft Word
2. File → Open
3. Select this file (APPLICATION_DEMO_GUIDE.md)
4. Word converts automatically
5. Save as .docx

### Method 2: Google Docs
1. Open Google Docs
2. File → Open → Upload
3. Upload this file
4. Download as Word (.docx)

### Method 3: Online Converter
1. Visit: https://www.markdowntoword.com
2. Upload this file
3. Download converted Word document

---

**End of Demo Guide**

**Document Version:** 1.0  
**Last Updated:** May 20, 2026  
**Application:** Compliance Tracker Notifier  
**Status:** Production Ready