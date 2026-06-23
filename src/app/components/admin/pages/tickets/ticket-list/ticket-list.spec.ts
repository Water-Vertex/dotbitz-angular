import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSupportTickets } from './ticket-list';

describe('AdminSupportTickets', () => {
  let component: AdminSupportTickets;
  let fixture: ComponentFixture<AdminSupportTickets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSupportTickets]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSupportTickets);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
