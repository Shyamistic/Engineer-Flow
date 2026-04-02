import { Component, inject, OnInit, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobService, JobRequest } from '../../core/services/job.service';
import { LucideAngularModule } from 'lucide-angular';
import { SignalRService } from '../../core/services/signalr.service';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Toolbar -->
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
           <h2 class="text-3xl font-bold text-white">Job Requests</h2>
           <p class="text-slate-400">Manage, track and update engineering tasks.</p>
        </div>
        <div class="flex items-center gap-3">
           <button (click)="openCreateModal()" class="btn-primary">
              <lucide-icon name="plus" size="20"></lucide-icon>
              New Request
           </button>
           <div class="flex items-center gap-2 glass-card px-3 py-1">
              <button (click)="exportPdf()" class="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors" title="Export PDF">
                 <lucide-icon name="file-text" size="20"></lucide-icon>
              </button>
              <div class="w-px h-6 bg-white/10"></div>
              <button (click)="refresh()" class="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors" title="Refresh">
                 <lucide-icon name="rotate-cw" size="20"></lucide-icon>
              </button>
           </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="glass-card p-4 flex flex-wrap items-center gap-4">
         <div class="relative flex-1 min-w-[250px]">
            <lucide-icon name="search" size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></lucide-icon>
            <input type="text" [(ngModel)]="searchQuery" (input)="onSearch()" 
                   placeholder="Search by title, requester or description..." 
                   class="input-field pl-12 py-2">
         </div>
         
         <select [(ngModel)]="statusFilter" (change)="onFilter()" class="input-field w-auto py-2 pr-10">
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="InProgress">In Progress</option>
            <option value="OnHold">On Hold</option>
            <option value="Completed">Completed</option>
         </select>

         <select [(ngModel)]="priorityFilter" (change)="onFilter()" class="input-field w-auto py-2 pr-10">
            <option value="">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
         </select>
      </div>

      <!-- Grid / Table -->
      <div class="glass-card overflow-hidden">
         <table class="w-full text-left border-collapse">
            <thead>
               <tr class="border-b border-white border-opacity-5 text-slate-400 text-sm font-semibold uppercase tracking-wider">
                  <th class="px-6 py-4">Request</th>
                  <th class="px-6 py-4">Status</th>
                  <th class="px-6 py-4">Priority</th>
                  <th class="px-6 py-4">Assigned To</th>
                  <th class="px-6 py-4 text-right">Actions</th>
               </tr>
            </thead>
            <tbody class="divide-y divide-white divide-opacity-5">
               <tr *ngFor="let job of jobs()" class="hover:bg-white hover:bg-opacity-5 transition-colors group">
                  <td class="px-6 py-5">
                     <div class="flex flex-col">
                        <span class="text-white font-bold text-lg group-hover:text-primary-400 transition-colors cursor-pointer" (click)="viewDetails(job)">{{ job.title }}</span>
                        <div class="flex items-center gap-2 text-xs text-slate-500 mt-1">
                           <span class="bg-primary-500/10 text-primary-400 px-2 py-0.5 rounded uppercase font-mono">{{ job.category || 'GEN' }}</span>
                           <span>•</span>
                           <span>Req by {{ job.requesterName }}</span>
                           <span>•</span>
                           <span>{{ job.createdAt | date:'short' }}</span>
                        </div>
                     </div>
                  </td>
                  <td class="px-6 py-5">
                     <div [class]="'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ' + getStatusClass(job.statusLabel)">
                        <div class="w-1.5 h-1.5 rounded-full" [class]="getStatusDotClass(job.statusLabel)"></div>
                        {{ job.statusLabel }}
                     </div>
                  </td>
                  <td class="px-6 py-5">
                     <div [class]="'flex items-center gap-1.5 font-semibold ' + getPriorityColor(job.priority)">
                        <lucide-icon [name]="getPriorityIcon(job.priority)" size="16"></lucide-icon>
                        {{ job.priorityLabel }}
                     </div>
                  </td>
                  <td class="px-6 py-5 text-slate-300">
                     <div class="flex items-center gap-2" *ngIf="job.assignedTo; else unassigned">
                        <div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold">{{ job.assignedTo[0] }}</div>
                        {{ job.assignedTo }}
                     </div>
                     <ng-template #unassigned>
                        <span class="text-slate-500 italic text-sm">Unassigned</span>
                     </ng-template>
                  </td>
                  <td class="px-6 py-5 text-right">
                     <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button (click)="updateStatus(job)" class="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white" title="Quick Status Update">
                           <lucide-icon name="check-circle-2" size="18"></lucide-icon>
                        </button>
                        <button (click)="viewDetails(job)" class="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white" title="View Details">
                           <lucide-icon name="more-vertical" size="18"></lucide-icon>
                        </button>
                     </div>
                  </td>
               </tr>
            </tbody>
         </table>
         
         <div *ngIf="jobs().length === 0" class="flex flex-col items-center justify-center py-20 text-slate-500 italic">
            <lucide-icon name="search" size="48" class="mb-4 opacity-20"></lucide-icon>
            No job requests found matching your filters.
         </div>
      </div>
    </div>
  `
})
export class JobListComponent implements OnInit {
  private jobService = inject(JobService);
  private signalR = inject(SignalRService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  jobs = signal<JobRequest[]>([]);
  searchQuery = '';
  statusFilter = '';
  priorityFilter = '';

  constructor() {
    // Listen for real-time changes
    effect(() => {
      const created = this.signalR.jobCreated();
      const updated = this.signalR.jobUpdated();
      const deletedId = this.signalR.jobDeleted();

      if (created) {
        this.toastr.info(`New Job Created: ${created.title}`, 'Real-Time Update');
        this.refresh();
      }
      if (updated) {
        this.toastr.info(`Job Updated: ${updated.title}`, 'Real-Time Update');
        this.refresh();
      }
      if (deletedId) {
        this.toastr.warning(`Job Request Removed`, 'Real-Time Update');
        this.refresh();
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    const params = {
      search: this.searchQuery,
      status: this.statusFilter || undefined,
      priority: this.priorityFilter || undefined,
      sortBy: 'updatedat',
      descending: true
    };
    this.jobService.getAll(params).subscribe(data => this.jobs.set(data));
  }

  onFilter() { this.refresh(); }
  onSearch() { this.refresh(); }

  openCreateModal() {
     this.router.navigate(['/requests/new']);
  }

  viewDetails(job: JobRequest) {
     this.router.navigate(['/requests', job.id]);
  }

  updateStatus(job: JobRequest) {
     // Cycle status for demo
     const nextStatus = (job.status + 1) % 4; // Open -> InProgress -> OnHold -> Completed
     this.jobService.updateStatus(job.id, nextStatus).subscribe(() => {
        this.toastr.success('Status updated successfully');
        this.refresh();
     });
  }

  exportPdf() {
     window.open(`${environment.apiUrl}/Export/jobs/pdf`, '_blank');
  }

  // UI Helpers
  getStatusClass(label: string) {
    const s = label?.toLowerCase() || '';
    if (s.includes('complete')) return 'bg-green-500/10 text-green-400';
    if (s.includes('progress')) return 'bg-blue-500/10 text-blue-400';
    if (s.includes('hold')) return 'bg-yellow-500/10 text-yellow-500';
    return 'bg-slate-500/10 text-slate-400';
  }

  getStatusDotClass(label: string) {
    const s = label?.toLowerCase() || '';
    if (s.includes('complete')) return 'bg-green-400';
    if (s.includes('progress')) return 'bg-blue-400';
    if (s.includes('hold')) return 'bg-yellow-500';
    return 'bg-slate-400';
  }

  getPriorityColor(p: number) {
    if (p === 3) return 'text-red-400';
    if (p === 2) return 'text-orange-400';
    if (p === 1) return 'text-blue-400';
    return 'text-slate-400';
  }

  getPriorityIcon(p: number) {
     if (p === 3) return 'alert-circle';
     if (p === 2) return 'alert-circle';
     return 'clock';
  }
}
