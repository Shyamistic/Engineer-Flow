import { Component, inject, OnInit, signal, effect, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';
import { environment } from '../../../environments/environment';
import { Chart, registerables } from 'chart.js';
import { SignalRService } from '../../core/services/signalr.service';
import { JobService } from '../../core/services/job.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="space-y-8 animate-fade-in p-2">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-extrabold text-white tracking-tight">Engineering Dashboard</h1>
          <p class="text-slate-400 mt-2">Real-time job request analytics and system health.</p>
        </div>
        <div class="flex items-center gap-3 glass-card px-4 py-2" [class.text-green-400]="signalR.connectionStatus() === 'Connected'">
          <div class="w-2 h-2 rounded-full animate-pulse" [class.bg-green-400]="signalR.connectionStatus() === 'Connected'" [class.bg-red-400]="signalR.connectionStatus() !== 'Connected'"></div>
          <span class="text-xs font-semibold uppercase tracking-wider">{{ signalR.connectionStatus() }}</span>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="glass-card p-6 border-l-4 border-primary-500">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-primary-500/10 rounded-xl text-primary-400">
               <lucide-icon name="clipboard-list" size="24"></lucide-icon>
            </div>
            <div>
              <div class="text-sm text-slate-400 font-medium">Total Requests</div>
              <div class="text-3xl font-bold text-white">{{ stats().totalRequests }}</div>
            </div>
          </div>
        </div>

        <div class="glass-card p-6 border-l-4 border-yellow-500">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-yellow-500/10 rounded-xl text-yellow-400">
               <lucide-icon name="clock" size="24"></lucide-icon>
            </div>
            <div>
              <div class="text-sm text-slate-400 font-medium">In Progress</div>
              <div class="text-3xl font-bold text-white">{{ stats().inProgressRequests }}</div>
            </div>
          </div>
        </div>

        <div class="glass-card p-6 border-l-4 border-green-500">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-green-500/10 rounded-xl text-green-400">
               <lucide-icon name="check-circle-2" size="24"></lucide-icon>
            </div>
            <div>
              <div class="text-sm text-slate-400 font-medium">Completed</div>
              <div class="text-3xl font-bold text-white">{{ stats().completedRequests }}</div>
            </div>
          </div>
        </div>

        <div class="glass-card p-6 border-l-4 border-red-500">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-red-500/10 rounded-xl text-red-400">
               <lucide-icon name="alert-circle" size="24"></lucide-icon>
            </div>
            <div>
              <div class="text-sm text-slate-400 font-medium">Open / Critical</div>
              <div class="text-3xl font-bold text-white">{{ stats().openRequests }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="glass-card p-8">
          <div class="flex items-center justify-between mb-8">
             <h3 class="text-xl font-bold text-white flex items-center gap-2">
                <lucide-icon name="activity" size="20" class="text-primary-400"></lucide-icon>
                Monthly Trends
             </h3>
          </div>
          <div class="h-[300px]">
            <canvas #trendsChart></canvas>
          </div>
        </div>

        <div class="glass-card p-8">
          <div class="flex items-center justify-between mb-8">
             <h3 class="text-xl font-bold text-white flex items-center gap-2">
                <lucide-icon name="filter" size="20" class="text-primary-400"></lucide-icon>
                Category Distribution
             </h3>
          </div>
          <div class="h-[300px] flex items-center justify-center">
            <canvas #categoryChart></canvas>
          </div>
        </div>
      </div>
      
      <!-- Recent Activity Feed (Optional) -->
      <div class="glass-card p-8 mt-8">
        <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
           <lucide-icon name="file-text" size="20"></lucide-icon>
           System Activity Logs
        </h3>
        <div class="space-y-4">
           <div *ngFor="let job of recentJobs()" class="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group">
              <div [class]="'w-2 h-10 rounded-full ' + getPriorityColor(job.priority)"></div>
              <div class="flex-1">
                 <div class="text-white font-semibold group-hover:text-primary-400 transition-colors uppercase text-xs tracking-widest font-mono">
                    {{ job.category || 'NO CATEGORY' }}
                 </div>
                 <div class="text-lg font-bold text-white">{{ job.title }}</div>
                 <div class="text-sm text-slate-400">Created by {{ job.requesterName }} • {{ job.createdAt | date:'short' }}</div>
              </div>
              <div [class]="'px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest ' + getStatusClass(job.statusLabel)">
                 {{ job.statusLabel }}
              </div>
           </div>
           
           <div *ngIf="recentJobs().length === 0" class="text-center py-10 text-slate-500">
               No recent activity recorded.
           </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit, AfterViewInit {
  private http = inject(HttpClient);
  signalR = inject(SignalRService);
  jobService = inject(JobService);

  @ViewChild('trendsChart') trendsChartRef!: ElementRef;
  @ViewChild('categoryChart') categoryChartRef!: ElementRef;

  private trendsChart: Chart<'line', number[], string> | null = null;
  private categoryChart: Chart<'doughnut', number[], string> | null = null;

  stats = signal<any>({
    totalRequests: 0,
    openRequests: 0,
    inProgressRequests: 0,
    completedRequests: 0,
    requestsByCategory: {},
    monthlyTrends: []
  });

  recentJobs = signal<any[]>([]);

  constructor() {
    // Effect to update dash when SignalR event happens
    effect(() => {
      if (this.signalR.jobCreated() || this.signalR.jobUpdated() || this.signalR.jobDeleted()) {
        this.loadDashboard();
      }
    });
  }

  ngOnInit() {
    this.loadDashboard();
    this.loadRecentJobs();
  }

  ngAfterViewInit() {
    // We will initialize charts once data is loaded
    if (this.stats().totalRequests > 0) {
      this.updateCharts();
    }
  }

  private loadDashboard() {
    this.http.get(`${environment.apiUrl}/Analytics/dashboard`).subscribe(data => {
      this.stats.set(data);
      this.updateCharts();
    });
  }

  private loadRecentJobs() {
    this.jobService.getAll({ sortBy: 'createdat', descending: true }).subscribe(jobs => {
      this.recentJobs.set(jobs.slice(0, 5));
    });
  }

  private updateCharts() {
    const s = this.stats();
    if (!s || !this.trendsChartRef || !this.categoryChartRef) return;

    // Line Chart for Trends
    if (this.trendsChart) this.trendsChart.destroy();
    
    try {
      this.trendsChart = new Chart(this.trendsChartRef.nativeElement, {
        type: 'line',
        data: {
          labels: s.monthlyTrends.map((t: any) => t.month),
          datasets: [{
            label: 'Incoming Job Requests',
            data: s.monthlyTrends.map((t: any) => t.count),
            borderColor: '#0ea5e9',
            backgroundColor: 'rgba(14, 165, 233, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#0ea5e9',
            pointBorderWidth: 2,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { 
              beginAtZero: true, 
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#94a3b8' }
            },
            x: { 
              grid: { display: false },
              ticks: { color: '#94a3b8' }
            }
          }
        }
      });

      // Doughnut Chart for Categories
      if (this.categoryChart) this.categoryChart.destroy();
      const catLabels = Object.keys(s.requestsByCategory);
      const catData = Object.values(s.requestsByCategory);

      this.categoryChart = new Chart(this.categoryChartRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: catLabels as string[],
          datasets: [{
            data: catData as number[],
            backgroundColor: ['#0ea5e9', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'],
            borderWidth: 0,
            hoverOffset: 10
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { 
              position: 'right',
              labels: { 
                color: '#94a3b8', 
                font: { weight: 'bold', size: 12 }, 
                padding: 20 
              }
            }
          },
          cutout: '70%'
        }
      });
    } catch (err) {
      console.error('Error initializing charts:', err);
    }
  }

  getPriorityColor(p: number) {
    if (p === 3) return 'bg-red-500';
    if (p === 2) return 'bg-orange-500';
    if (p === 1) return 'bg-blue-500';
    return 'bg-slate-500';
  }

  getStatusClass(status: string) {
    const s = status.toLowerCase();
    if (s.includes('complete')) return 'bg-green-500/10 text-green-400';
    if (s.includes('progress')) return 'bg-primary-500/10 text-primary-400';
    if (s.includes('open')) return 'bg-yellow-500/10 text-yellow-500';
    return 'bg-slate-500/10 text-slate-400';
  }
}