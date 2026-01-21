import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

export interface ModalConfig {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  title: string;
  content: string;
  subtitle?: string;
  htmlContent?: string;
  confirmText?: string;
  cancelText?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  dismissable?: boolean;
  showCancel?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalsSubject = new BehaviorSubject<ModalConfig[]>([]);
  modals$ = this.modalsSubject.asObservable();

  show(config: Partial<ModalConfig>): string {
    const id = uuidv4();
    const defaultConfig: ModalConfig = {
      id,
      type: 'info',
      title: 'Information',
      content: '',
      dismissable: true,
      showCancel: true,
      size: 'md'
    };

    const modalConfig: ModalConfig = { ...defaultConfig, ...config };
    
    const currentModals = this.modalsSubject.getValue();
    this.modalsSubject.next([...currentModals, modalConfig]);
    
    return id;
  }

  hide(id: string): void {
    const currentModals = this.modalsSubject.getValue();
    const updatedModals = currentModals.filter(modal => modal.id !== id);
    this.modalsSubject.next(updatedModals);
  }

  hideAll(): void {
    this.modalsSubject.next([]);
  }

  // Helper methods for common modal types
  success(config: Partial<ModalConfig>): string {
    return this.show({
      type: 'success',
      title: 'Success',
      ...config
    });
  }

  error(config: Partial<ModalConfig>): string {
    return this.show({
      type: 'error',
      title: 'Error',
      ...config
    });
  }

  warning(config: Partial<ModalConfig>): string {
    return this.show({
      type: 'warning',
      title: 'Warning',
      ...config
    });
  }

  info(config: Partial<ModalConfig>): string {
    return this.show({
      type: 'info',
      title: 'Information',
      ...config
    });
  }

  confirm(config: Partial<ModalConfig>): string {
    return this.show({
      type: 'confirm',
      title: 'Confirmation',
      showCancel: true,
      ...config
    });
  }
}