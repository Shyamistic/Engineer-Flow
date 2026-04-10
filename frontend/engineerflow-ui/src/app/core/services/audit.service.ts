import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuditFilters, AuditPagedResult, AuditStats } from '../models/job-request.model';

@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/Audit`;

  getAuditTrail(filters: AuditFilters = {}): Observable<AuditPagedResult> {
    let params = new HttpParams();
    if (filters.page) params = params.set('page', String(filters.page));
    if (filters.pageSize) params = params.set('pageSize', String(filters.pageSize));
    if (filters.action) params = params.set('action', filters.action);
    if (filters.entityType) params = params.set('entityType', filters.entityType);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);
    if (filters.isFlagged !== undefined) params = params.set('isFlagged', String(filters.isFlagged));
    return this.http.get<AuditPagedResult>(this.baseUrl, { params });
  }

  getStats(): Observable<AuditStats> {
    return this.http.get<AuditStats>(`${this.baseUrl}/stats`);
  }

  getActionTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/action-types`);
  }

  exportToCsv(items: any[]): void {
    if (!items.length) return;
    const headers = ['ID', 'Action', 'Entity Type', 'Entity ID', 'Entity Title', 'Details', 'User', 'IP Address', 'Timestamp'];
    const rows = items.map(e => [
      e.id, e.action, e.entityType, e.entityId ?? '', e.entityTitle ?? '',
      `"${(e.details ?? '').replace(/"/g, '""')}"`,
      e.user, e.ipAddress ?? '', new Date(e.timestamp).toISOString()
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
