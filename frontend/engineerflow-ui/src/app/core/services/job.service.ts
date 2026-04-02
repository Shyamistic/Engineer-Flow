import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';

export interface JobRequest {
  id: number;
  title: string;
  description: string;
  requesterName: string;
  assignedTo?: string;
  priority: number;
  priorityLabel: string;
  status: number;
  statusLabel: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  isOverdue: boolean;
  attachments?: any[];
  activityLogs?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/JobRequests`;

  public jobs = signal<JobRequest[]>([]);
  public loading = signal<boolean>(false);

  public getAll(params?: any): Observable<JobRequest[]> {
    this.loading.set(true);
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.set(key, params[key]);
      });
    }

    return this.http.get<JobRequest[]>(this.apiUrl, { params: httpParams }).pipe(
      tap(jobs => {
        this.jobs.set(jobs);
        this.loading.set(false);
      })
    );
  }

  public getById(id: number): Observable<JobRequest> {
    return this.http.get<JobRequest>(`${this.apiUrl}/${id}`);
  }

  public create(job: any): Observable<JobRequest> {
    return this.http.post<JobRequest>(this.apiUrl, job);
  }

  public update(id: number, job: any): Observable<JobRequest> {
    return this.http.put<JobRequest>(`${this.apiUrl}/${id}`, job);
  }

  public updateStatus(id: number, status: number): Observable<any> {
    const statusNames = ['Open', 'InProgress', 'OnHold', 'Completed', 'Cancelled'];
    return this.http.patch(`${this.apiUrl}/${id}/status`, JSON.stringify(statusNames[status] ?? 'Open'), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  public delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
