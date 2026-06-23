import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../../../../services/ticket.service';

@Component({
  selector: 'app-tickets-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './ticket-list.html',
})
export class AdminSupportTickets implements OnInit {

  tickets: any[]  = [];
  allTickets: any[] = [];
  loading  = false;
  replying = false;

  // Filters
  selectedStatus = '';
  searchTerm     = '';

  // Reply modal
  showReplyModal  = false;
  selectedTicket: any = null;
  replyText       = '';

  constructor(
    private ticketService: TicketService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.loadTickets(); }

  loadTickets(): void {
    this.loading = true;
    this.ticketService.getAdminTickets().subscribe({
      next: (res: any) => {
        this.allTickets = res.data || [];
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilter(): void {
    let filtered = [...this.allTickets];
    if (this.selectedStatus) {
      filtered = filtered.filter(t => t.status === this.selectedStatus);
    }
    if (this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.name?.toLowerCase().includes(q) ||
        t.email?.toLowerCase().includes(q) ||
        t.ticket_number?.toLowerCase().includes(q) ||
        t.issue?.toLowerCase().includes(q)
      );
    }
    this.tickets = filtered;
    this.cdr.detectChanges();
  }

  onSearch(): void { this.applyFilter(); }
  onStatusFilter(): void { this.applyFilter(); }

  // Open reply modal
  openReplyModal(ticket: any): void {
    this.selectedTicket = ticket;
    this.replyText      = ticket.latest_reply?.reply || '';
    this.showReplyModal = true;
  }

  closeReplyModal(): void {
    this.showReplyModal  = false;
    this.selectedTicket  = null;
    this.replyText       = '';
  }

  submitReply(): void {
    if (!this.replyText.trim()) {
      alert('Please enter a reply.');
      return;
    }
    this.replying = true;
    this.ticketService.replyTicket(this.selectedTicket.id, this.replyText.trim()).subscribe({
      next: (res: any) => {
        this.replying = false;
        // Update ticket in list
        const idx = this.allTickets.findIndex(t => t.id === this.selectedTicket.id);
        if (idx !== -1) {
          this.allTickets[idx] = res.data;
        }
        this.applyFilter();
        this.closeReplyModal();
        this.cdr.detectChanges();
      },
      error: () => {
        this.replying = false;
        alert('Failed to send reply.');
      }
    });
  }

  updateStatus(ticketId: number, status: string): void {
    this.ticketService.updateTicketStatus(ticketId, status).subscribe({
      next: (res: any) => {
        const idx = this.allTickets.findIndex(t => t.id === ticketId);
        if (idx !== -1) this.allTickets[idx] = res.data;
        this.applyFilter();
        this.cdr.detectChanges();
      },
      error: () => { alert('Failed to update status.'); }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':    return 'bg-yellow-100 text-yellow-700';
      case 'in_review':  return 'bg-blue-100 text-blue-700';
      case 'responded':  return 'bg-purple-100 text-purple-700';
      case 'resolved':   return 'bg-green-100 text-green-700';
      case 'closed':     return 'bg-gray-100 text-gray-600';
      default:           return 'bg-gray-100 text-gray-600';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending':   return 'Pending';
      case 'in_review': return 'In Review';
      case 'responded': return 'Responded';
      case 'resolved':  return 'Resolved';
      case 'closed':    return 'Closed';
      default:          return status;
    }
  }

  getUserTypeBadge(userType: string): string {
    return userType === 'student'
      ? 'bg-blue-100 text-blue-700'
      : 'bg-purple-100 text-purple-700';
  }
}