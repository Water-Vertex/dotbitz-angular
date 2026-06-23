import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentQueries } from './assessment-queries';

describe('AssessmentQueries', () => {
  let component: AssessmentQueries;
  let fixture: ComponentFixture<AssessmentQueries>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentQueries]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentQueries);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
