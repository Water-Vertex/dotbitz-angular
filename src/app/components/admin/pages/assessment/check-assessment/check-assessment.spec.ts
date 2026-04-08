import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckAssessment } from './check-assessment';

describe('CheckAssessment', () => {
  let component: CheckAssessment;
  let fixture: ComponentFixture<CheckAssessment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckAssessment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckAssessment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
