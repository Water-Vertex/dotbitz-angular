import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttemptedAssessment } from './attempted-assessment';

describe('AttemptedAssessment', () => {
  let component: AttemptedAssessment;
  let fixture: ComponentFixture<AttemptedAssessment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttemptedAssessment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttemptedAssessment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
