import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketsAdd } from './tickets-add';

describe('TicketsAdd', () => {
  let component: TicketsAdd;
  let fixture: ComponentFixture<TicketsAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketsAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketsAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
