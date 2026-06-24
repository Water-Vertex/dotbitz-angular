import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentAdd } from './assignment-add';

describe('AssignmentAdd', () => {
  let component: AssignmentAdd;
  let fixture: ComponentFixture<AssignmentAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignmentAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignmentAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
