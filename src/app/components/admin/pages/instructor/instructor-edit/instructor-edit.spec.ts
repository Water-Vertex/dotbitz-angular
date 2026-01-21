import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorEdit } from './instructor-edit';

describe('InstructorEdit', () => {
  let component: InstructorEdit;
  let fixture: ComponentFixture<InstructorEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructorEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
