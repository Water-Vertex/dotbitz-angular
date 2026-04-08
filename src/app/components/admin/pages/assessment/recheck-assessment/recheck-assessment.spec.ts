import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecheckAssessment } from './recheck-assessment';

describe('RecheckAssessment', () => {
  let component: RecheckAssessment;
  let fixture: ComponentFixture<RecheckAssessment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecheckAssessment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecheckAssessment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
