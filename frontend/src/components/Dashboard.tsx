import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, getAllTasks, getProjects } from '../api';
import { DashboardStats, TaskInstance, Project } from '../types';
import ChatbotWidget from './ChatbotWidget';

type DashboardProps = {
  onChatContextChange?: (context: {
    upcomingTasks: TaskInstance[];
    projects: Project[];
  }) => void;
};

function Dashboard({ onChatContextChange }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingTasks, setUpcomingTasks] = useState<TaskInstance[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [toastTaskIds, setToastTaskIds] = useState<number[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (!notificationsEnabled || upcomingTasks.length === 0) {
      return;
    }

    const dueSoonTasks = upcomingTasks
      .filter((task: TaskInstance) => {
        if (task.status !== 'pending') return false;
        const dueTime = new Date(task.planned_date).getTime();
        const now = new Date().getTime();
        const hoursUntilDue = (dueTime - now) / (1000 * 60 * 60);
        return hoursUntilDue <= 168;
      })
      .slice(0, 3);

    setToastTaskIds(dueSoonTasks.map((task: TaskInstance) => task.id));

    const timeout = window.setTimeout(() => {
      setToastTaskIds([]);
    }, 7000);

    return () => window.clearTimeout(timeout);
  }, [notificationsEnabled, upcomingTasks]);

  const loadDashboard = async () => {
    try {
      const [statsData, tasksData, projectsData] = await Promise.all([
        getDashboardStats(),
        getAllTasks('pending'),
        getProjects()
      ]);
      setStats(statsData);
      setUpcomingTasks(tasksData.slice(0, 8));
      setRecentProjects(projectsData.slice(0, 4));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    onChatContextChange?.({
      upcomingTasks,
      projects: recentProjects
    });
  }, [onChatContextChange, upcomingTasks, recentProjects]);

  const getTaskTimingLabel = (plannedDate: string) => {
    const dueDate = new Date(plannedDate);
    const today = new Date();
    const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffDays = Math.round((dueDay.getTime() - todayDay.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `${Math.abs(diffDays)} day(s) overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} day(s)`;
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Compliance operations</p>
          <h2>📊 Compliance Dashboard</h2>
          <p className="hero-text">
            Track active projects, upcoming evidence submissions, and overdue controls from one place.
          </p>
        </div>
        <Link to="/projects" className="hero-link">
          <button type="button" className="btn-primary hero-button">
            Manage Projects
          </button>
        </Link>
      </section>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Projects</h3>
            <div className="stat-value">{stats.active_projects}</div>
            <div className="stat-label">Active / {stats.total_projects} Total</div>
          </div>

          <div className="stat-card">
            <h3>Controls</h3>
            <div className="stat-value">{stats.applicable_controls}</div>
            <div className="stat-label">Applicable / {stats.total_controls} Total</div>
          </div>

          <div className="stat-card urgent">
            <h3>Due Today</h3>
            <div className="stat-value">{stats.tasks_due_today}</div>
            <div className="stat-label">Tasks</div>
          </div>

          <div className="stat-card warning">
            <h3>This Week</h3>
            <div className="stat-value">{stats.tasks_due_this_week}</div>
            <div className="stat-label">Tasks</div>
          </div>

          <div className="stat-card danger">
            <h3>Overdue</h3>
            <div className="stat-value">{stats.overdue_tasks}</div>
            <div className="stat-label">Tasks</div>
          </div>

          <div className="stat-card success">
            <h3>Completed</h3>
            <div className="stat-value">{stats.completed_tasks}</div>
            <div className="stat-label">Tasks</div>
          </div>
        </div>
      )}

      {notificationsEnabled && toastTaskIds.length > 0 && (
        <div className="notification-stack">
          {upcomingTasks
            .filter((task: TaskInstance) => toastTaskIds.includes(task.id))
            .map((task: TaskInstance) => (
              <div key={task.id} className="notification-toast">
                <div className="notification-toast-header">
                  <strong>Reminder</strong>
                  <button
                    type="button"
                    className="notification-toast-close"
                    onClick={() => setToastTaskIds((current: number[]) => current.filter((id: number) => id !== task.id))}
                  >
                    ×
                  </button>
                </div>
                <div className="notification-toast-title">
                  {task.raw_task_name || task.control_title || task.instance_label}
                </div>
                <div className="notification-toast-body">
                  {task.project_code && <span>{task.project_code} · </span>}
                  Due {new Date(task.planned_date).toLocaleDateString()}
                </div>
              </div>
            ))}
        </div>
      )}

      <div className="dashboard-grid">
        <div className="upcoming-tasks">
          <div className="section-heading">
            <h3>📅 Upcoming Tasks</h3>
            <span className="section-subtitle">Next pending activities</span>
          </div>
          <div className="notification-demo-bar">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setNotificationsEnabled((current: boolean) => !current)}
            >
              {notificationsEnabled ? 'Disable Popup Demo' : 'Enable Popup Demo'}
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() =>
                setToastTaskIds(
                  upcomingTasks
                    .filter((task: TaskInstance) => task.status === 'pending')
                    .slice(0, 3)
                    .map((task: TaskInstance) => task.id)
                )
              }
              disabled={upcomingTasks.length === 0}
            >
              Show Sample Popup
            </button>
          </div>
          {upcomingTasks.length === 0 ? (
            <div className="empty-state">
              <p>No upcoming tasks yet.</p>
              <span>Create a project and import the compliance spreadsheet to generate task schedules.</span>
            </div>
          ) : (
            <div className="task-list">
              {upcomingTasks.map((task: TaskInstance) => (
                <Link
                  key={task.id}
                  to={`/projects/${task.project_id}`}
                  className="task-item task-item-link"
                >
                  <div className="task-info">
                    <div className="task-label">
                      {task.raw_task_name || task.control_title || task.instance_label}
                    </div>
                    {(task.project_code || task.control_description) && (
                      <div className="task-description">
                        {task.project_code && <strong>{task.project_code}</strong>}
                        {task.project_code && task.control_description ? ' · ' : ''}
                        {task.control_description}
                      </div>
                    )}
                    <div className="task-date">
                      Due: {new Date(task.planned_date).toLocaleDateString()} · {getTaskTimingLabel(task.planned_date)}
                    </div>
                    <div className="task-meta-inline">
                      {task.control_code && <span>{task.control_code}</span>}
                      {task.scheduled_frequency && <span>{task.scheduled_frequency}</span>}
                      {task.assigned_to && task.assigned_to.length > 0 && (
                        <span>Owner: {task.assigned_to.join(', ')}</span>
                      )}
                    </div>
                  </div>
                  <div className={`task-status ${task.status}`}>
                    {task.status}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="side-panel">
          <div className="quick-panel">
            <div className="section-heading">
              <h3>📁 Recent Projects</h3>
              <span className="section-subtitle">Jump back into active work</span>
            </div>
            {recentProjects.length === 0 ? (
              <div className="empty-state compact">
                <p>No projects created</p>
              </div>
            ) : (
              <div className="mini-project-list">
                {recentProjects.map((project: Project) => (
                  <Link key={project.id} to={`/projects/${project.id}`} className="mini-project-card">
                    <div className="mini-project-top">
                      <strong>{project.name}</strong>
                      <span className={`status-badge ${project.status}`}>{project.status}</span>
                    </div>
                    <span>{project.code}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="quick-panel">
            <div className="section-heading">
              <h3>⚡ Quick Start</h3>
              <span className="section-subtitle">Recommended workflow</span>
            </div>
            <ol className="quick-steps">
              <li>Create a project with client and team details.</li>
              <li>Upload the compliance Excel workbook for that project.</li>
              <li>Review planned tasks and mark evidence completion over time.</li>
            </ol>
          </div>
        </div>
      </div>
      <ChatbotWidget upcomingTasks={upcomingTasks} projects={recentProjects} />
    </div>
  );
}

export default Dashboard;

// Made with Bob
