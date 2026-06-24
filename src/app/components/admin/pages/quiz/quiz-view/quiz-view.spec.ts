import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizView } from './quiz-view';

describe('QuizView', () => {
  let component: QuizView;
  let fixture: ComponentFixture<QuizView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
