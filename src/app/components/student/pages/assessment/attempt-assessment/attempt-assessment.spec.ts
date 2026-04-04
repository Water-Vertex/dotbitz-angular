import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttemptAssessment } from './attempt-assessment';

describe('AttemptAssessment', () => {
  let component: AttemptAssessment;
  let fixture: ComponentFixture<AttemptAssessment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttemptAssessment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttemptAssessment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
