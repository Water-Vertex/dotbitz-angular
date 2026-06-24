import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchEdit } from './batch-edit';

describe('BatchEdit', () => {
  let component: BatchEdit;
  let fixture: ComponentFixture<BatchEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatchEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BatchEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
