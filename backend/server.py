from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import shutil
import secrets
from pathlib import Path

from db import get_db, init_db
from models import Project, ControlTemplate, ProjectControl, TaskInstance
from schemas import (
    Project as ProjectSchema,
    ProjectCreate,
    ProjectUpdate,
    ControlTemplate as ControlTemplateSchema,
    TaskInstance as TaskInstanceSchema,
    TaskInstanceDetail as TaskInstanceDetailSchema,
    TaskInstanceUpdate,
    DashboardStats,
    ExcelImportResponse,
    ExcelWorkbookSheetsResponse,
    ExcelSheetInfo
)
from excel_service import ExcelImportService
from datetime import datetime, timedelta

app = FastAPI(title="Compliance Tracker API", version="1.0.0")

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_db()
    print("Database initialized successfully")

# Health check
@app.get("/")
def read_root():
    return {"message": "Compliance Tracker API", "status": "running"}

# ==================== PROJECT ENDPOINTS ====================

@app.post("/api/projects", response_model=ProjectSchema, status_code=status.HTTP_201_CREATED)
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    """Create a new project"""
    existing = db.query(Project).filter(Project.code == project.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Project code already exists")

    db_project = Project(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.get("/api/projects", response_model=List[ProjectSchema])
def get_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all projects"""
    projects = db.query(Project).offset(skip).limit(limit).all()
    return projects

@app.get("/api/projects/{project_id}", response_model=ProjectSchema)
def get_project(project_id: int, db: Session = Depends(get_db)):
    """Get a specific project"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@app.put("/api/projects/{project_id}", response_model=ProjectSchema)
def update_project(project_id: int, project_update: ProjectUpdate, db: Session = Depends(get_db)):
    """Update a project"""
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    update_data = project_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_project, field, value)

    db_project.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_project)
    return db_project

@app.delete("/api/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: int, db: Session = Depends(get_db)):
    """Delete a project"""
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(db_project)
    db.commit()
    return None

# ==================== EXCEL IMPORT ENDPOINTS ====================

@app.post("/api/excel/sheets", response_model=ExcelWorkbookSheetsResponse)
async def list_excel_sheets(file: UploadFile = File(...)):
    """Upload workbook temporarily and list sheet names for selection"""
    if not file.filename or not file.filename.endswith(('.xlsx', '.xlsm')):
        raise HTTPException(status_code=400, detail="Only .xlsx and .xlsm files are supported")

    file_token = secrets.token_hex(16)
    file_path = UPLOAD_DIR / f"{file_token}_{file.filename}"

    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        excel_service = ExcelImportService(None)
        sheet_names = excel_service.get_sheet_names(str(file_path))

        return ExcelWorkbookSheetsResponse(
            success=True,
            file_token=file_token,
            sheets=[ExcelSheetInfo(name=name, index=index) for index, name in enumerate(sheet_names)],
            message="Select the sheet from which tasks should be imported"
        )
    except Exception as e:
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail=f"Failed to inspect Excel workbook: {str(e)}")

@app.post("/api/projects/{project_id}/import-excel", response_model=ExcelImportResponse)
async def import_excel(
    project_id: int,
    sheet_name: str = Form(...),
    file_token: str = Form(...),
    original_filename: str = Form(...),
    db: Session = Depends(get_db)
):
    """Import Excel file for a project from a selected sheet"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    matching_files = list(UPLOAD_DIR.glob(f"{file_token}_*"))
    if not matching_files:
        raise HTTPException(status_code=400, detail="Uploaded workbook session expired. Please upload the file again.")

    file_path = matching_files[0]

    try:
        excel_service = ExcelImportService(db)
        result = excel_service.import_to_project(project_id, str(file_path), sheet_name=sheet_name)

        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("message", "Import failed"))

        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")
    finally:
        if file_path.exists():
            file_path.unlink()

# ==================== CONTROL TEMPLATE ENDPOINTS ====================

@app.get("/api/control-templates", response_model=List[ControlTemplateSchema])
def get_control_templates(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all control templates"""
    templates = db.query(ControlTemplate).filter(ControlTemplate.is_active == True).offset(skip).limit(limit).all()
    return templates

@app.get("/api/control-templates/{template_id}", response_model=ControlTemplateSchema)
def get_control_template(template_id: int, db: Session = Depends(get_db)):
    """Get a specific control template"""
    template = db.query(ControlTemplate).filter(ControlTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Control template not found")
    return template

# ==================== TASK INSTANCE ENDPOINTS ====================

def _serialize_task_detail(task: TaskInstance) -> TaskInstanceDetailSchema:
    control_template = task.project_control.control_template if task.project_control else None
    project_control = task.project_control

    raw_metadata = {}
    if task.completion_notes:
        for line in task.completion_notes.splitlines():
            if ": " not in line:
                continue
            key, value = line.split(": ", 1)
            raw_metadata[key.strip().lower().replace(" ", "_")] = value.strip()

    source_row_number = raw_metadata.get("source_row")
    try:
        parsed_source_row_number = int(source_row_number) if source_row_number else None
    except ValueError:
        parsed_source_row_number = None

    return TaskInstanceDetailSchema(
        id=task.id,
        project_control_id=task.project_control_id,
        project_id=task.project_id,
        control_template_id=task.control_template_id,
        instance_label=task.instance_label,
        planned_date=task.planned_date,
        actual_date=task.actual_date,
        status=task.status,
        completion_notes=task.completion_notes,
        evidence_uploaded=task.evidence_uploaded,
        created_at=task.created_at,
        updated_at=task.updated_at,
        control_title=control_template.title if control_template else None,
        control_description=control_template.description if control_template else None,
        control_code=control_template.control_code if control_template else None,
        scheduled_frequency=control_template.scheduled_frequency if control_template else None,
        assigned_to=project_control.assigned_to if project_control and project_control.assigned_to else [],
        evidence_location=project_control.evidence_location if project_control else None,
        project_code=task.project.code if task.project else None,
        source_sheet=raw_metadata.get("source_sheet"),
        source_row_number=parsed_source_row_number,
        raw_task_name=raw_metadata.get("task_name"),
        raw_task_description=raw_metadata.get("task_description"),
        raw_guidance=raw_metadata.get("guidance"),
        raw_frequency_event=raw_metadata.get("event_frequency"),
        raw_frequency_scheduled=raw_metadata.get("scheduled_frequency"),
        raw_assigned_to=raw_metadata.get("assigned_to"),
        raw_evidence_location=raw_metadata.get("evidence_location"),
        raw_planned_date=raw_metadata.get("planned_date_raw"),
        raw_actual_date=raw_metadata.get("actual_date_raw")
    )

@app.get("/api/projects/{project_id}/tasks", response_model=List[TaskInstanceDetailSchema])
def get_project_tasks(
    project_id: int,
    status_filter: str | None = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all tasks for a project"""
    query = db.query(TaskInstance).filter(TaskInstance.project_id == project_id)

    if status_filter:
        query = query.filter(TaskInstance.status == status_filter)

    tasks = query.order_by(TaskInstance.planned_date).offset(skip).limit(limit).all()
    return [_serialize_task_detail(task) for task in tasks]

@app.get("/api/tasks", response_model=List[TaskInstanceDetailSchema])
def get_all_tasks(
    status_filter: str | None = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all tasks across all projects"""
    query = db.query(TaskInstance)

    if status_filter:
        query = query.filter(TaskInstance.status == status_filter)

    tasks = query.order_by(TaskInstance.planned_date).offset(skip).limit(limit).all()
    return [_serialize_task_detail(task) for task in tasks]

@app.put("/api/tasks/{task_id}", response_model=TaskInstanceSchema)
def update_task(task_id: int, task_update: TaskInstanceUpdate, db: Session = Depends(get_db)):
    """Update a task instance"""
    db_task = db.query(TaskInstance).filter(TaskInstance.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = task_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)

    if db_task.actual_date:
        db_task.status = "completed"
    elif db_task.status == "completed":
        db_task.status = "pending"

    db_task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_task)
    return db_task

@app.post("/api/tasks/{task_id}/complete", response_model=TaskInstanceSchema)
def complete_task(task_id: int, db: Session = Depends(get_db)):
    """Mark a task as complete"""
    db_task = db.query(TaskInstance).filter(TaskInstance.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    db_task.status = "completed"
    db_task.actual_date = datetime.utcnow()
    db_task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_task)
    return db_task

# ==================== DASHBOARD ENDPOINTS ====================

@app.get("/api/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics"""
    total_projects = db.query(Project).count()
    active_projects = db.query(Project).filter(Project.status == "active").count()

    total_controls = db.query(ControlTemplate).filter(ControlTemplate.is_active == True).count()
    applicable_controls = db.query(ProjectControl).filter(ProjectControl.is_applicable == True).count()

    today = datetime.utcnow().date()
    tomorrow = today + timedelta(days=1)
    week_end = today + timedelta(days=7)

    tasks_due_today = db.query(TaskInstance).filter(
        TaskInstance.status == "pending",
        TaskInstance.planned_date >= datetime.combine(today, datetime.min.time()),
        TaskInstance.planned_date < datetime.combine(tomorrow, datetime.min.time())
    ).count()

    tasks_due_this_week = db.query(TaskInstance).filter(
        TaskInstance.status == "pending",
        TaskInstance.planned_date >= datetime.combine(today, datetime.min.time()),
        TaskInstance.planned_date < datetime.combine(week_end, datetime.min.time())
    ).count()

    overdue_tasks = db.query(TaskInstance).filter(
        TaskInstance.status == "pending",
        TaskInstance.planned_date < datetime.combine(today, datetime.min.time())
    ).count()

    completed_tasks = db.query(TaskInstance).filter(TaskInstance.status == "completed").count()

    return DashboardStats(
        total_projects=total_projects,
        active_projects=active_projects,
        total_controls=total_controls,
        applicable_controls=applicable_controls,
        tasks_due_today=tasks_due_today,
        tasks_due_this_week=tasks_due_this_week,
        overdue_tasks=overdue_tasks,
        completed_tasks=completed_tasks
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Made with Bob
