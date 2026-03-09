import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchList } from './batch-list';

describe('BatchList', () => {
  let component: BatchList;
  let fixture: ComponentFixture<BatchList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatchList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BatchList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
