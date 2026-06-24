import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchCard } from './batch-card';

describe('BatchCard', () => {
  let component: BatchCard;
  let fixture: ComponentFixture<BatchCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatchCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BatchCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
