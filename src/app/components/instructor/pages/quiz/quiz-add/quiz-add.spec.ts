import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizAdd } from './quiz-add';

describe('QuizAdd', () => {
  let component: QuizAdd;
  let fixture: ComponentFixture<QuizAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
