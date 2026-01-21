import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorAdd } from './instructor-add';

describe('InstructorAdd', () => {
  let component: InstructorAdd;
  let fixture: ComponentFixture<InstructorAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructorAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
