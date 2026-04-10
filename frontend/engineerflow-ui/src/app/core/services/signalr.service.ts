import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection: signalR.HubConnection | null = null;
  
  // Real-time signals
  public jobCreated = signal<any>(null);
  public jobUpdated = signal<any>(null);
  public jobDeleted = signal<number | null>(null);
  public connectionStatus = signal<'Connected' | 'Disconnected' | 'Connecting'>('Disconnected');
  public auditEntryCreated = signal<any>(null);

  public startConnection(token: string) {
    this.connectionStatus.set('Connecting');
    
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.hubUrl}/jobs`, {
        accessTokenFactory: () => token,
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR Connection started');
        this.connectionStatus.set('Connected');
        this.joinGroup();
      })
      .catch(err => {
        console.error('Error while starting SignalR connection: ' + err);
        this.connectionStatus.set('Disconnected');
      });

    this.registerOnEvents();
  }

  private registerOnEvents() {
    this.hubConnection?.on('JobCreated', (job) => {
      this.jobCreated.set(job);
    });

    this.hubConnection?.on('JobUpdated', (job) => {
      this.jobUpdated.set(job);
    });

    this.hubConnection?.on('JobDeleted', (id) => {
      this.jobDeleted.set(id);
    });

    this.hubConnection?.on('AuditEntryCreated', (entry) => {
      this.auditEntryCreated.set(entry);
    });
  }

  private joinGroup() {
    this.hubConnection?.invoke('JoinJobUpdates');
  }

  public stopConnection() {
    this.hubConnection?.stop();
    this.connectionStatus.set('Disconnected');
  }
}
