import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminQuizAttempts } from './quiz-attempt';

describe('AdminQuizAttempts', () => {
  let component: AdminQuizAttempts;
  let fixture: ComponentFixture<AdminQuizAttempts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminQuizAttempts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminQuizAttempts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
