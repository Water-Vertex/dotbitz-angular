import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentAdd } from './assessment-add';

describe('AssessmentAdd', () => {
  let component: AssessmentAdd;
  let fixture: ComponentFixture<AssessmentAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
