import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorLogout } from './instructor-logout';

describe('InstructorLogout', () => {
  let component: InstructorLogout;
  let fixture: ComponentFixture<InstructorLogout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorLogout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructorLogout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
