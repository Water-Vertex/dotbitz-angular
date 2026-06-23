import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentSupportTickets } from './ticket-add';

describe('StudentSupportTickets', () => {
  let component: StudentSupportTickets;
  let fixture: ComponentFixture<StudentSupportTickets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentSupportTickets]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentSupportTickets);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
