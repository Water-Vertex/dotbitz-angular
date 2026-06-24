import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cancellation } from './cancellation';

describe('Cancellation', () => {
  let component: Cancellation;
  let fixture: ComponentFixture<Cancellation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cancellation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cancellation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
