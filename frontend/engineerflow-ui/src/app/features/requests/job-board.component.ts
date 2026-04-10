import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { LucideAngularModule } from 'lucide-angular';
import { JobRequestService } from '../../core/services/job-request.service';
import { JobRequest, RequestStatus } from '../../core/models/job-request.model';
import { ToastrService } from 'ngx-toastr';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-job-board',
  standalone: true,
  imports: [CommonModule, DragDropModule, LucideAngularModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Agile Job Board</h1>
          <p class="page-subtitle">Drag and drop to quickly update request status</p>
        </div>
      </div>

      <div class="board-wrapper">
        <div class="board" cdkDropListGroup>

          <!-- Open Column -->
          <div class="board-column">
            <div class="column-header">
              <h3>Open</h3>
              <span class="count-badge">{{openRequests.length}}</span>
            </div>
            <div class="column-content" cdkDropList id="col-open"
                 [cdkDropListData]="openRequests"
                 (cdkDropListDropped)="drop($event, 0)">
              @for(req of openRequests; track req.id) {
                <div class="board-card" cdkDrag [routerLink]="['/requests', req.id]">
                  <div class="card-priority" [ngClass]="req.priorityLabel.toLowerCase()"></div>
                  <h4 class="card-title">{{req.title}}</h4>
                  <div class="card-footer">
                    <span class="requester"><lucide-icon name="user" size="14"></lucide-icon> {{req.requesterName}}</span>
                    <span class="category" *ngIf="req.category">{{req.category}}</span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- In Progress Column -->
          <div class="board-column">
            <div class="column-header">
              <h3>In Progress</h3>
              <span class="count-badge">{{inProgressRequests.length}}</span>
            </div>
            <div class="column-content" cdkDropList id="col-in-progress"
                 [cdkDropListData]="inProgressRequests"
                 (cdkDropListDropped)="drop($event, 1)">
              @for(req of inProgressRequests; track req.id) {
                <div class="board-card" cdkDrag [routerLink]="['/requests', req.id]">
                  <div class="card-priority" [ngClass]="req.priorityLabel.toLowerCase()"></div>
                  <h4 class="card-title">{{req.title}}</h4>
                  <div class="card-footer">
                    <span class="requester"><lucide-icon name="user" size="14"></lucide-icon> {{req.requesterName}}</span>
                    <span class="assigned" *ngIf="req.assignedTo">{{req.assignedTo}}</span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- On Hold Column -->
          <div class="board-column">
            <div class="column-header">
              <h3>On Hold</h3>
              <span class="count-badge">{{onHoldRequests.length}}</span>
            </div>
            <div class="column-content" cdkDropList id="col-hold"
                 [cdkDropListData]="onHoldRequests"
                 (cdkDropListDropped)="drop($event, 2)">
              @for(req of onHoldRequests; track req.id) {
                <div class="board-card op-50" cdkDrag [routerLink]="['/requests', req.id]">
                  <div class="card-priority" [ngClass]="req.priorityLabel.toLowerCase()"></div>
                  <h4 class="card-title">{{req.title}}</h4>
                  <div class="card-footer">
                    <span class="requester"><lucide-icon name="user" size="14"></lucide-icon> {{req.requesterName}}</span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Completed Column -->
          <div class="board-column">
            <div class="column-header">
              <h3>Completed</h3>
              <span class="count-badge">{{completedRequests.length}}</span>
            </div>
            <div class="column-content" cdkDropList id="col-completed"
                 [cdkDropListData]="completedRequests"
                 (cdkDropListDropped)="drop($event, 3)">
              @for(req of completedRequests; track req.id) {
                <div class="board-card done" cdkDrag [routerLink]="['/requests', req.id]">
                  <h4 class="card-title strike">{{req.title}}</h4>
                  <div class="card-footer">
                    <span class="requester"><lucide-icon name="check-circle" size="14" class="text-success"></lucide-icon> Done</span>
                  </div>
                </div>
              }
            </div>
          </div>
          
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .board-wrapper {
      flex: 1;
      overflow-x: auto;
      overflow-y: hidden;
      margin-top: 24px;
    }

    .board {
      display: flex;
      gap: 20px;
      height: 100%;
      min-width: 1200px;
      padding-bottom: 20px;
    }

    .board-column {
      flex: 1;
      background: var(--color-surface);
      border-radius: 12px;
      border: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      max-height: 100%;
    }

    .column-header {
      padding: 16px;
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .column-header h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .count-badge {
      background: rgba(255,255,255,0.06);
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      color: var(--color-text-muted);
    }

    .column-content {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-height: 150px;
    }

    .board-card {
      position: relative;
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 16px;
      cursor: grab;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: all 0.2s;
    }

    .board-card:hover {
      border-color: var(--color-accent);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .board-card:active {
      cursor: grabbing;
    }

    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      border: 1px solid var(--color-accent);
      background: var(--color-surface);
      opacity: 0.9;
    }

    .cdk-drag-placeholder {
      opacity: 0;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .column-content.cdk-drop-list-dragging .board-card:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .card-priority {
      position: absolute;
      left: 0;
      top: 12px;
      bottom: 12px;
      width: 4px;
      border-radius: 0 4px 4px 0;
    }
    
    .critical { background: #ef4444; }
    .high { background: #f97316; }
    .medium { background: #3b82f6; }
    .low { background: #10b981; }

    .card-title {
      margin: 0 0 12px 6px;
      font-size: 14px;
      font-weight: 500;
      color: var(--color-text-primary);
      line-height: 1.4;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-left: 6px;
      font-size: 12px;
      color: var(--color-text-muted);
    }

    .requester {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .category, .assigned {
      background: rgba(255,255,255,0.05);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
    }
    
    .op-50 { opacity: 0.6; }
    .strike { text-decoration: line-through; color: var(--color-text-muted); }
    .text-success { color: #10b981; }
  `]
})
export class JobBoardComponent implements OnInit {
  private service = inject(JobRequestService);
  private toast = inject(ToastrService);

  openRequests: JobRequest[] = [];
  inProgressRequests: JobRequest[] = [];
  onHoldRequests: JobRequest[] = [];
  completedRequests: JobRequest[] = [];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.service.getAll().subscribe({
      next: (reqs: JobRequest[]) => {
        this.openRequests = reqs.filter((r: JobRequest) => r.status.toString() === 'Open' || r.status === 0);
        this.inProgressRequests = reqs.filter((r: JobRequest) => r.status.toString() === 'InProgress' || r.status === 1);
        this.onHoldRequests = reqs.filter((r: JobRequest) => r.status.toString() === 'OnHold' || r.status === 2);
        this.completedRequests = reqs.filter((r: JobRequest) => r.status.toString() === 'Completed' || r.status === 3);
      }
    });
  }

  drop(event: CdkDragDrop<JobRequest[]>, newStatusValue: RequestStatus) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const item = event.previousContainer.data[event.previousIndex];
      // Note: Full completion requires the completion dto, so prevent direct drag to 'Completed' unless implemented differently
      if (newStatusValue === 3 && item.status.toString() !== 'Completed' && item.status !== 3) {
        this.toast.warning('Please use the detail view to formally complete a ticket (requires resolution notes).');
        return;
      }
      
      if (item.status.toString() === 'Completed' || item.status === 3) {
        this.toast.error('Completed tickets cannot be moved.');
        return;
      }
      
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      item.status = newStatusValue;
      this.service.updateStatus(item.id, newStatusValue).subscribe({
        error: () => {
          this.toast.error('Failed to update status');
          this.loadData(); // Revert
        }
      });
    }
  }
}
