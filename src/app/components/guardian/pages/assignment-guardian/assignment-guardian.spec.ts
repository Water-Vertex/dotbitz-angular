import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentGuardian } from './assignment-guardian';

describe('AssignmentGuardian', () => {
  let component: AssignmentGuardian;
  let fixture: ComponentFixture<AssignmentGuardian>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignmentGuardian]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignmentGuardian);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
