import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { guardianAuthGuard } from './guardian-auth-guard';

describe('guardianAuthGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
      TestBed.runInInjectionContext(() => guardianAuthGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

