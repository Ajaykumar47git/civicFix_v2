/**
 * Unit Tests for Civic Issue Reporting Service
 */
import { IssueService } from '../services/issue.service';
import { InMemoryIssueRepository } from '../repositories/issue.repository';
import { IssueStatus, IssuePriority } from '../entities/Issue.entity';
import { TestResult } from './auth.service.test';

export async function runIssueUnitTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  const runTest = async (name: string, fn: () => Promise<void>) => {
    const start = performance.now();
    try {
      await fn();
      results.push({
        suite: 'IssueService & Workflow Layer',
        name,
        passed: true,
        durationMs: Math.round((performance.now() - start) * 100) / 100
      });
    } catch (err: any) {
      results.push({
        suite: 'IssueService & Workflow Layer',
        name,
        passed: false,
        durationMs: Math.round((performance.now() - start) * 100) / 100,
        error: err.message || String(err)
      });
    }
  };

  // 1. Successful Issue Creation
  await runTest('IssueService.createIssue generates CVX tracking code, sets REPORTED status and calculates SLA', async () => {
    const repo = new InMemoryIssueRepository();
    const service = new IssueService(repo);

    const res = await service.createIssue('usr-cit-01', 4, {
      categoryId: 1, // Roads & Pavements (48h SLA)
      title: 'Deep Sinkhole Near Crosswalk',
      description: 'Dangerous subsidence in the asphalt measuring approximately 3 feet across. Vehicles bottoming out.',
      latitude: 37.7749,
      longitude: -122.4194,
      address: '555 Mission St, San Francisco, CA',
      landmark: 'Across from Salesforce Tower',
      priority: IssuePriority.HIGH,
      photoUrls: ['https://images.unsplash.com/photo-1541888946425-d0fbb186156a']
    });

    const issue = res.issue;
    if (!issue.issueCode.startsWith('CVX-')) throw new Error(`Invalid issue code format: ${issue.issueCode}`);
    if (issue.status !== IssueStatus.REPORTED) throw new Error(`Initial status must be REPORTED, got ${issue.status}`);
    if (issue.reportedById !== 'usr-cit-01') throw new Error('User ownership attribution failed');
    if (issue.photoReferences.length !== 1) throw new Error('Photo reference count mismatch');
    
    // Check SLA deadline (~48 hours in future)
    const deadlineDiffHours = (new Date(issue.slaDeadline).getTime() - new Date(issue.createdAt).getTime()) / 3600000;
    if (Math.round(deadlineDiffHours) !== 48) {
      throw new Error(`SLA deadline hours calculation incorrect: ${deadlineDiffHours} vs expected 48`);
    }
  });

  // 2. Reject Out of Municipal Bounds Coordinates
  await runTest('IssueService.createIssue rejects coordinates outside municipal boundaries (400 Bad Request)', async () => {
    const repo = new InMemoryIssueRepository();
    const service = new IssueService(repo);

    let rejected = false;
    try {
      await service.createIssue('usr-cit-01', 4, {
        categoryId: 1,
        title: 'Road crack in another country',
        description: 'This is an issue located thousands of miles outside the city jurisdiction.',
        latitude: 51.5074, // London, UK
        longitude: -0.1278,
        address: 'Trafalgar Square, London'
      });
    } catch (err: any) {
      rejected = true;
      if (err.status !== 400) throw new Error(`Expected status 400, received ${err.status}`);
      if (!err.detail.includes('outside municipal jurisdiction')) {
        throw new Error(`Unexpected error detail: ${err.detail}`);
      }
    }
    if (!rejected) throw new Error('Service accepted coordinates outside city boundary');
  });

  // 3. Short Title & Short Description Validation
  await runTest('IssueService.createIssue rejects brief titles (<10 chars) or brief descriptions (<20 chars)', async () => {
    const repo = new InMemoryIssueRepository();
    const service = new IssueService(repo);

    // Short title
    let shortTitleRejected = false;
    try {
      await service.createIssue('usr-cit-01', 4, {
        categoryId: 1,
        title: 'Hole',
        description: 'Detailed description that is long enough to satisfy requirements.',
        latitude: 37.7749,
        longitude: -122.4194,
        address: '100 Main St'
      });
    } catch {
      shortTitleRejected = true;
    }
    if (!shortTitleRejected) throw new Error('Failed to reject short title');

    // Short description
    let shortDescRejected = false;
    try {
      await service.createIssue('usr-cit-01', 4, {
        categoryId: 1,
        title: 'Valid Length Issue Title Here',
        description: 'Too short',
        latitude: 37.7749,
        longitude: -122.4194,
        address: '100 Main St'
      });
    } catch {
      shortDescRejected = true;
    }
    if (!shortDescRejected) throw new Error('Failed to reject short description');
  });

  // 4. Query and Filter by Reporter
  await runTest('IssueService.getMyIssues correctly filters and paginates issues owned by citizen', async () => {
    const repo = new InMemoryIssueRepository();
    const service = new IssueService(repo);

    const res = await service.getMyIssues('usr-cit-01');
    if (res.items.length < 2) throw new Error('Expected at least 2 seeded issues for usr-cit-01');
    for (const item of res.items) {
      if (item.reportedById !== 'usr-cit-01') throw new Error('Leaked issue belonging to different reporter');
    }
  });

  // 5. Public Tracking by Code
  await runTest('IssueService.getIssueByCode resolves issue record using public CVX grievance number', async () => {
    const repo = new InMemoryIssueRepository();
    const service = new IssueService(repo);

    const issue = await service.getIssueByCode('CVX-2026-08142');
    if (issue.issueCode !== 'CVX-2026-08142') throw new Error('Issue code lookup returned incorrect entity');
    if (issue.categoryId !== 2) throw new Error('Category mismatch on resolved issue');
  });

  return results;
}
