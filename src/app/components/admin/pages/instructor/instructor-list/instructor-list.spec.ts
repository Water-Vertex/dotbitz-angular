import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorList } from './instructor-list';

describe('InstructorList', () => {
  let component: InstructorList;
  let fixture: ComponentFixture<InstructorList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructorList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
