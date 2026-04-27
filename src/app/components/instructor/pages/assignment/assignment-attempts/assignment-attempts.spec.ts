import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorAssignmentAttempts } from './assignment-attempts';

describe('InstructorAssignmentAttempts', () => {
  let component: InstructorAssignmentAttempts;
  let fixture: ComponentFixture<InstructorAssignmentAttempts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorAssignmentAttempts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructorAssignmentAttempts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
