import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { instructorAuthGuard } from './instructor-auth-guard';

describe('instructorAuthGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
      TestBed.runInInjectionContext(() => instructorAuthGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

