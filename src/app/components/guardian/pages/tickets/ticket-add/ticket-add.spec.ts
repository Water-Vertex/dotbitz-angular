import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuardianSupportTickets } from './ticket-add';

describe('GuardianSupportTickets', () => {
  let component: GuardianSupportTickets;
  let fixture: ComponentFixture<GuardianSupportTickets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuardianSupportTickets]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuardianSupportTickets);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
