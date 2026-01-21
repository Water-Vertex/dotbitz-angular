import { Injectable } from '@angular/core';



@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor() {}

  success(title: string, message: string) {
    this.showToast(title, message, 'success');
  }

  error(title: string, message: string) {
    this.showToast(title, message, 'error');
  }

  info(title: string, message: string) {
    this.showToast(title, message, 'info');
  }

  private showToast(title: string, message: string, type: 'success' | 'error' | 'info') {
    const colorMap = {
      success: '#10b981',
      error: '#ef4444',
      info: '#3b82f6'
    };

    const toast = document.createElement('div');
    toast.className = 'fixed bottom-5 right-5 z-50 max-w-xs p-4 rounded-lg shadow-lg text-white animate-slide-in';
    toast.style.backgroundColor = colorMap[type];
    
    toast.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        </div>
        <div class="ml-3">
          <strong class="font-semibold">${title}</strong>
          <div class="mt-1 text-sm opacity-90">${message}</div>
        </div>
        <button class="ml-auto -mx-1.5 -my-1.5 text-white hover:text-gray-100" onclick="this.parentElement.parentElement.remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    
    document.body.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 5000);
  }
}