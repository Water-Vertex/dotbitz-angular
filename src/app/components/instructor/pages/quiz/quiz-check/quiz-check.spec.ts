import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizCheck } from './quiz-check';

describe('QuizCheck', () => {
  let component: QuizCheck;
  let fixture: ComponentFixture<QuizCheck>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizCheck]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizCheck);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
