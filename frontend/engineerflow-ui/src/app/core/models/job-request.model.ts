export enum Priority { Low = 0, Medium = 1, High = 2, Critical = 3 }
export enum RequestStatus { Open = 0, InProgress = 1, OnHold = 2, Completed = 3, Cancelled = 4 }

export interface ActivityLog {
  id: number;
  action: string;
  details: string;
  user: string;
  timestamp: string;
}

export interface CompletionEvent {
  id: number;
  completedBy: string;
  completedAt: string;
  notes?: string;
  durationMinutes?: number;
  resolutionSummary?: string;
}

export interface JobRequest {
  id: number;
  title: string;
  description: string;
  requesterName: string;
  assignedTo?: string;
  priority: Priority;
  priorityLabel: string;
  status: RequestStatus;
  statusLabel: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  isOverdue: boolean;
  completionEvent?: CompletionEvent;
  activityLogs?: ActivityLog[];
}

export interface JobRequestSummary {
  total: number;
  open: number;
  inProgress: number;
  onHold: number;
  completed: number;
  cancelled: number;
  overdue: number;
  critical: number;
}

export interface CreateJobRequest {
  title: string;
  description: string;
  requesterName: string;
  assignedTo?: string;
  priority: Priority;
  category?: string;
  dueDate?: string;
}

export interface UpdateJobRequest {
  title?: string;
  description?: string;
  assignedTo?: string;
  priority?: Priority;
  status?: RequestStatus;
  category?: string;
  dueDate?: string;
}

export interface RecordCompletion {
  completedBy: string;
  notes?: string;
  durationMinutes?: number;
  resolutionSummary?: string;
}

export interface JobRequestFilters {
  status?: string;
  priority?: string;
  search?: string;
  sortBy?: string;
  descending?: boolean;
}

export interface AuditTrailEntry {
  id: number;
  entityType: string;
  entityId?: string;
  action: string;
  details: string;
  user: string;
  ipAddress?: string;
  entityTitle?: string;
  timestamp: string;
  isFlagged: boolean;
  flagReason?: string;
}

export interface AuditPagedResult {
  items: AuditTrailEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuditFilters {
  page?: number;
  pageSize?: number;
  action?: string;
  entityType?: string;
  search?: string;
  from?: string;
  to?: string;
  isFlagged?: boolean;
}

export interface AuditStats {
  totalEvents: number;
  last24hEvents: number;
  last7dEvents: number;
  topUser: string;
  recentActions: AuditTrailEntry[];
}