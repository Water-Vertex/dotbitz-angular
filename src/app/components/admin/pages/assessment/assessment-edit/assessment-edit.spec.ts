import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentEdit } from './assessment-edit';

describe('AssessmentEdit', () => {
  let component: AssessmentEdit;
  let fixture: ComponentFixture<AssessmentEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
