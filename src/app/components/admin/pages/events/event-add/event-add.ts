import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../../../../services/event.service';

@Component({
  selector: 'app-admin-event-add',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './event-add.html',
})
export class AdminEventForm implements OnInit {

  isEdit   = false;
  eventId!: number;
  loading  = false;
  saving   = false;

  // Form fields
  name        = '';
  description = '';
  location    = '';
  date        = '';
  startTime   = '';
  endTime     = '';
  status      = 'active';

  imageFile: File | null     = null;
  imagePreview: string | null = null;
  existingImage: string | null = null;

  constructor(
    private eventService: EventService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit  = true;
      this.eventId = +id;
      this.loadEvent();
    }
  }

  loadEvent(): void {
    this.loading = true;
    this.eventService.getAdminEvent(this.eventId).subscribe({
      next: (res: any) => {
        const e         = res.data;
        this.name        = e.name;
        this.description = e.description || '';
        this.location    = e.location    || '';
        this.date        = e.date;
        this.startTime   = e.start_time  || '';
        this.endTime     = e.end_time    || '';
        this.status      = e.status;
        this.existingImage = e.image;
        this.loading     = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        alert('Failed to load event.');
        this.router.navigate(['/admin/event/list']);
      }
    });
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.imageFile = input.files[0];
      const reader   = new FileReader();
      reader.onload  = (e: any) => {
        this.imagePreview = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(this.imageFile);
    }
  }

  onSubmit(): void {
    if (!this.name.trim() || !this.date || !this.startTime) {
      alert('Please fill required fields: Name, Date, Start Time.');
      return;
    }

    this.saving = true;
    const formData = new FormData();
    formData.append('name',        this.name.trim());
    formData.append('description', this.description);
    formData.append('location',    this.location);
    formData.append('date',        this.date);
    formData.append('start_time',  this.startTime);
    formData.append('end_time',    this.endTime);
    formData.append('status',      this.status);
    if (this.imageFile) {
      formData.append('image', this.imageFile);
    }

    const request$ = this.isEdit
      ? this.eventService.updateEvent(this.eventId, formData)
      : this.eventService.createEvent(formData);

    request$.subscribe({
      next: () => {
        this.saving = false;
        alert(`Event ${this.isEdit ? 'updated' : 'created'} successfully!`);
        this.router.navigate(['/admin/event/list']);
      },
    error: (error) => {
    this.saving = false;
    console.log('Full error object:', error);

    // Check for validation errors
    if (error.error && typeof error.error === 'object') {
        console.log('Error response:', error.error);

        if (error.error.errors) {
            let message = 'Validation failed:\n';
            Object.keys(error.error.errors).forEach(key => {
                message += `${key}: ${error.error.errors[key].join(', ')}\n`;
            });
            alert(message);
        } else if (error.error.message) {
            alert(error.error.message);
        } else {
            alert(JSON.stringify(error.error));
        }
    } else {
        alert('Failed to save event. Check console for details.');
    }
}
    });
  }
}
