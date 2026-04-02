import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  JobRequest, JobRequestSummary, CreateJobRequest,
  UpdateJobRequest, RecordCompletion, JobRequestFilters, RequestStatus
} from '../models/job-request.model';

@Injectable({ providedIn: 'root' })
export class JobRequestService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/JobRequests`;

  getAll(filters: JobRequestFilters = {}): Observable<JobRequest[]> {
    let params = new HttpParams();
    if (filters.status) params = params.set('status', filters.status);
    if (filters.priority) params = params.set('priority', filters.priority);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.descending !== undefined) params = params.set('descending', String(filters.descending));
    return this.http.get<JobRequest[]>(this.baseUrl, { params });
  }

  getById(id: number): Observable<JobRequest> {
    return this.http.get<JobRequest>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateJobRequest): Observable<JobRequest> {
    return this.http.post<JobRequest>(this.baseUrl, dto);
  }

  update(id: number, dto: UpdateJobRequest): Observable<JobRequest> {
    return this.http.put<JobRequest>(`${this.baseUrl}/${id}`, dto);
  }

  updateStatus(id: number, status: RequestStatus): Observable<JobRequest> {
    // Backend uses JsonStringEnumConverter, so send the enum name as string
    const statusNames = ['Open', 'InProgress', 'OnHold', 'Completed', 'Cancelled'];
    return this.http.patch<JobRequest>(`${this.baseUrl}/${id}/status`, JSON.stringify(statusNames[status]), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  recordCompletion(id: number, dto: RecordCompletion): Observable<JobRequest> {
    return this.http.post<JobRequest>(`${this.baseUrl}/${id}/complete`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getSummary(): Observable<JobRequestSummary> {
    return this.http.get<JobRequestSummary>(`${this.baseUrl}/summary`);
  }
}