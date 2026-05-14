import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketsList } from './tickets-list';

describe('TicketsList', () => {
  let component: TicketsList;
  let fixture: ComponentFixture<TicketsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
