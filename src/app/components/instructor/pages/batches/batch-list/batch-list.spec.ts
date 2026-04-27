import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorBatchList } from './batch-list';

describe('InstructorBatchList', () => {
  let component: InstructorBatchList;
  let fixture: ComponentFixture<InstructorBatchList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorBatchList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructorBatchList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
