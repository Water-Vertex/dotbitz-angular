import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentStudent } from './assignment-student';

describe('AssignmentStudent', () => {
  let component: AssignmentStudent;
  let fixture: ComponentFixture<AssignmentStudent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignmentStudent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignmentStudent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
