import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { JobRequestService } from './job-request.service';
import { environment } from '../../../environments/environment';

describe('JobRequestService', () => {
  let service: JobRequestService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [JobRequestService]
    });
    service = TestBed.inject(JobRequestService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all job requests', () => {
    const mockJobs = [
      { id: 1, title: 'Test Job 1', statusLabel: 'Open' },
      { id: 2, title: 'Test Job 2', statusLabel: 'InProgress' }
    ];

    service.getAll().subscribe(jobs => {
      expect(jobs.length).toBe(2);
      expect(jobs).toEqual(mockJobs as any);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/JobRequests`);
    expect(req.request.method).toBe('GET');
    req.flush(mockJobs);
  });

  it('should create a job request', () => {
    const newJob = { title: 'New Job', description: 'Desc' };
    const mockResponse = { id: 3, ...newJob };

    service.create(newJob as any).subscribe(job => {
      expect(job.id).toBe(3);
      expect(job.title).toBe('New Job');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/JobRequests`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
});
