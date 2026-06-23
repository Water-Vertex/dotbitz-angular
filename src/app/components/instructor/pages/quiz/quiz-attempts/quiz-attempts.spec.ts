import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizAttempts } from './quiz-attempts';

describe('QuizAttempts', () => {
  let component: QuizAttempts;
  let fixture: ComponentFixture<QuizAttempts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizAttempts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizAttempts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
