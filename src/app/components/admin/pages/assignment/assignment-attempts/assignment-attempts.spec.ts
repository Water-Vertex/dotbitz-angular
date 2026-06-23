import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentAttempts } from './assignment-attempts';

describe('AssignmentAttempts', () => {
  let component: AssignmentAttempts;
  let fixture: ComponentFixture<AssignmentAttempts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignmentAttempts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignmentAttempts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
