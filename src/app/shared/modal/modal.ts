import { Component, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService, ModalConfig } from '../../services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Modal Container -->
    <div class="modal-container" [class.active]="modals.length > 0">
      <div *ngFor="let modal of modals; let i = index" class="modal-wrapper" [style.z-index]="1000 + i">
        <!-- Backdrop -->
        <div class="modal-backdrop" (click)="modal.dismissable !== false ? close(modal) : null"></div>
        
        <!-- Modal Content -->
        <div class="modal-content transform transition-all duration-300 animate-scale-in"
             [class]="getModalSize(modal)">
          
          <!-- Close Button (Top Right) -->
          <button *ngIf="modal.dismissable !== false" 
                  class="close-btn"
                  (click)="close(modal)">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <!-- Modal Header -->
          <div class="modal-header">
            <!-- Icon -->
            <div class="modal-icon">
              <ng-container [ngSwitch]="modal.type">
                <div *ngSwitchCase="'success'" class="icon-success">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div *ngSwitchCase="'error'" class="icon-error">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div *ngSwitchCase="'warning'" class="icon-warning">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                </div>
                <div *ngSwitchDefault class="icon-info">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </ng-container>
            </div>

            <!-- Title -->
            <div class="modal-title">
              <h3 class="text-xl font-bold text-gray-900">{{ modal.title }}</h3>
              <p *ngIf="modal.subtitle" class="text-gray-500 text-sm mt-1">{{ modal.subtitle }}</p>
            </div>
          </div>

          <!-- Modal Content -->
          <div class="modal-body">
            <div *ngIf="modal.htmlContent" [innerHTML]="modal.htmlContent" class="prose max-w-none"></div>
            <p *ngIf="!modal.htmlContent" class="text-gray-700 leading-relaxed">{{ modal.content }}</p>
          </div>

          <!-- Modal Actions -->
          <div class="modal-actions">
            <div class="actions-container">
              <button *ngIf="modal.showCancel !== false" 
                      class="cancel-btn"
                      (click)="onCancel(modal)">
                {{ modal.cancelText || 'Cancel' }}
              </button>
              <button class="confirm-btn"
                      [class]="getButtonClass(modal.type)"
                      (click)="onConfirm(modal)">
                <span class="flex items-center gap-2">
                  <ng-container [ngSwitch]="modal.type">
                    <svg *ngSwitchCase="'success'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <svg *ngSwitchCase="'error'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    <svg *ngSwitchDefault class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4"/>
                    </svg>
                  </ng-container>
                  {{ modal.confirmText || (modal.type === 'confirm' ? 'Confirm' : 'OK') }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Modal Container */
    .modal-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9999;
      display: none;
      align-items: center;
      justify-content: center;
    }

    .modal-container.active {
      display: flex;
    }

    /* Modal Wrapper */
    .modal-wrapper {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Backdrop */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 9998;
    }

    /* Modal Content */
    .modal-content {
      position: relative;
      background: white;
      border-radius: 1rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      max-height: 90vh;
      overflow-y: auto;
      z-index: 9999;
      margin: 1rem;
      animation: fadeInScale 0.3s ease-out;
    }

    /* Modal Sizes */
    .modal-sm {
      width: 100%;
      max-width: 400px;
    }

    .modal-md {
      width: 100%;
      max-width: 500px;
    }

    .modal-lg {
      width: 100%;
      max-width: 600px;
    }

    .modal-xl {
      width: 100%;
      max-width: 800px;
    }

    .modal-full {
      width: 100%;
      max-width: 95vw;
    }

    /* Close Button */
    .close-btn {
      position: absolute;
      right: 1rem;
      top: 1rem;
      background: transparent;
      border: none;
      padding: 0.5rem;
      cursor: pointer;
      color: #6b7280;
      transition: color 0.2s;
      z-index: 10;
    }

    .close-btn:hover {
      color: #374151;
    }

    /* Modal Header */
    .modal-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.5rem 1.5rem 0 1.5rem;
      margin-right: 2rem;
    }

    .modal-icon {
      flex-shrink: 0;
      margin-top: 0.25rem;
    }

    .modal-title {
      flex: 1;
    }

    /* Icon Colors */
    .icon-success {
      width: 2.5rem;
      height: 2.5rem;
      background: rgba(16, 185, 129, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #10b981;
    }

    .icon-error {
      width: 2.5rem;
      height: 2.5rem;
      background: rgba(239, 68, 68, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ef4444;
    }

    .icon-warning {
      width: 2.5rem;
      height: 2.5rem;
      background: rgba(245, 158, 11, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #f59e0b;
    }

    .icon-info {
      width: 2.5rem;
      height: 2.5rem;
      background: rgba(59, 130, 246, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #3b82f6;
    }

    /* Modal Body */
    .modal-body {
      padding: 1.5rem;
      color: #374151;
      line-height: 1.6;
    }

    /* Modal Actions */
    .modal-actions {
      padding: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .actions-container {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    .cancel-btn {
      padding: 0.625rem 1.25rem;
      color: #374151;
      background: transparent;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .cancel-btn:hover {
      color: #111827;
      background: #f9fafb;
      border-color: #9ca3af;
    }

    .confirm-btn {
      padding: 0.625rem 1.5rem;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .confirm-btn:hover {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }

    /* Button Colors */
    .btn-success {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    .btn-success:hover {
      background: linear-gradient(135deg, #0da271 0%, #047857 100%);
    }

    .btn-error {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }

    .btn-error:hover {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    }

    .btn-warning {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }

    .btn-warning:hover {
      background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
    }

    .btn-info {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    }

    .btn-info:hover {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
    }

    .btn-confirm {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    }

    .btn-confirm:hover {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
    }

    /* Animations */
    .animate-scale-in {
      animation: fadeInScale 0.3s ease-out;
    }

    @keyframes fadeInScale {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(-10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    /* Responsive */
    @media (max-width: 640px) {
      .modal-content {
        margin: 0.5rem;
        max-height: 85vh;
      }

      .modal-header {
        padding: 1rem 1rem 0 1rem;
      }

      .modal-body {
        padding: 1rem;
      }

      .modal-actions {
        padding: 1rem;
      }

      .actions-container {
        flex-direction: column-reverse;
        width: 100%;
      }

      .cancel-btn, .confirm-btn {
        width: 100%;
        text-align: center;
      }
    }
  `]
})
export class ModalComponent {
  modals: ModalConfig[] = [];

 constructor(private modalService: ModalService) {
  this.modalService.modals$.subscribe((modals: ModalConfig[]) => {
    this.modals = modals;
  });
}

  getModalSize(modal: ModalConfig): string {
  const sizes: Record<string, string> = {
    'sm': 'modal-sm',
    'md': 'modal-md',
    'lg': 'modal-lg',
    'xl': 'modal-xl',
    'full': 'modal-full'
  };
  
  // Use the size from modal or default to 'md'
  const sizeKey = (modal.size && sizes[modal.size]) ? modal.size : 'md';
  return sizes[sizeKey];
}

getButtonClass(type: string): string {
  const classes: Record<string, string> = {
    'success': 'btn-success',
    'error': 'btn-error',
    'warning': 'btn-warning',
    'info': 'btn-info',
    'confirm': 'btn-confirm'
  };
  
  // Use the type or default to 'info'
  const typeKey = (type && classes[type]) ? type : 'info';
  return classes[typeKey];
}

  onConfirm(modal: ModalConfig): void {
    if (modal.onConfirm) {
      modal.onConfirm();
    }
    this.close(modal);
  }

  onCancel(modal: ModalConfig): void {
    if (modal.onCancel) {
      modal.onCancel();
    }
    this.close(modal);
  }

  close(modal: ModalConfig): void {
    this.modalService.hide(modal.id);
  }
}