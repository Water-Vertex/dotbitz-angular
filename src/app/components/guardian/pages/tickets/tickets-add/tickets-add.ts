import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../../../../services/ticket.service';

@Component({
  selector: 'app-tickets-add',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './tickets-add.html',
})
export class GuardianSupportTickets implements OnInit {

  role: 'student' | 'guardian' = 'guardian'; // ✅ only this changes

  tickets: any[] = [];
  loading  = false;
  saving   = false;
  deleting: number | null = null;
  viewMode: 'list' | 'form' = 'list';
  isEdit   = false;
  editId: number | null = null;
  userName  = '';
  userEmail = '';
  phone   = '';
  issue   = '';
  message = '';
  showResponseModal  = false;
  viewingTicket: any = null;
  loadingResponse    = false;
  issues = [
    'Quiz', 'Assignment', 'Course', 'Payment',
    'General', 'Risk', 'Violence', 'Technical Issue', 'Other',
  ];

  constructor(
    private ticketService: TicketService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadTickets();
  }

  loadUserInfo(): void {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user    = JSON.parse(userStr);
        this.userName  = (user.first_name || '') + ' ' + (user.last_name || '');
        this.userEmail = user.email || '';
      }
    } catch (e) {}
  }

  loadTickets(): void {
    this.loading = true;
    this.ticketService.getTickets(this.role).subscribe({
      next: (res: any) => {
        this.tickets = res.data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; }
    });
  }

  openAddForm(): void {
    this.isEdit = false; this.editId = null;
    this.phone = ''; this.issue = ''; this.message = '';
    this.viewMode = 'form';
  }

  openEditForm(ticket: any): void {
    this.isEdit  = true; this.editId = ticket.id;
    this.phone   = ticket.phone   || '';
    this.issue   = ticket.issue   || '';
    this.message = ticket.message || '';
    this.viewMode = 'form';
  }

  cancelForm(): void { this.viewMode = 'list'; this.isEdit = false; this.editId = null; }

  onSubmit(): void {
    if (!this.phone.trim())  { alert('Please enter phone number.'); return; }
    if (!this.issue)         { alert('Please select an issue.');     return; }
    if (!this.message.trim()){ alert('Please enter your message.');  return; }

    this.saving = true;
    const payload = { phone: this.phone.trim(), issue: this.issue, message: this.message.trim() };

    const request$ = this.isEdit && this.editId
      ? this.ticketService.updateTicket(this.role, this.editId, payload)
      : this.ticketService.createTicket(this.role, payload);

    request$.subscribe({
      next: () => {
        this.saving = false; this.viewMode = 'list';
        this.loadTickets(); this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.saving = false;
        alert(err.error?.message || 'Failed to submit ticket.');
      }
    });
  }

  onDelete(id: number): void {
    if (!confirm('Delete this ticket?')) return;
    this.deleting = id;
    this.ticketService.deleteTicket(this.role, id).subscribe({
      next: () => {
        this.tickets  = this.tickets.filter(t => t.id !== id);
        this.deleting = null;
        this.cdr.detectChanges();
      },
      error: () => { this.deleting = null; alert('Failed to delete.'); }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':   return 'bg-yellow-100 text-yellow-700';
      case 'in_review': return 'bg-blue-100 text-blue-700';
      case 'resolved':  return 'bg-green-100 text-green-700';
      case 'closed':    return 'bg-gray-100 text-gray-600';
      default:          return 'bg-gray-100 text-gray-600';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending':   return 'Pending';
      case 'in_review': return 'In Review';
      case 'resolved':  return 'Resolved';
      case 'closed':    return 'Closed';
      default:          return status;
    }
  }

  canEdit(ticket: any): boolean {
    return ticket.status !== 'resolved' && ticket.status !== 'closed';
  }

  viewResponse(ticket: any): void {
  this.loadingResponse  = true;
  this.showResponseModal = true;
  this.viewingTicket    = ticket;

  // API call — status bhi update hoga (responded → resolved)
  this.ticketService.viewTicketReply(this.role, ticket.id).subscribe({
    next: (res: any) => {
      // Update ticket in list
      const idx = this.tickets.findIndex(t => t.id === ticket.id);
      if (idx !== -1) {
        this.tickets[idx] = res.data;
        this.viewingTicket = res.data;
      }
      this.loadingResponse = false;
      this.cdr.detectChanges();
    },
    error: () => { this.loadingResponse = false; }
  });
}

closeResponseModal(): void {
  this.showResponseModal = false;
  this.viewingTicket     = null;
}
}