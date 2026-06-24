import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchAdd } from './batch-add';

describe('BatchAdd', () => {
  let component: BatchAdd;
  let fixture: ComponentFixture<BatchAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatchAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BatchAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
