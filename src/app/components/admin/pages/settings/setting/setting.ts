

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingService } from '../../../../../services/settings.service';
import { ChangeDetectorRef } from '@angular/core';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './setting.html',
})
export class Setting implements OnInit {
  settings: any = {
    site_title: '',
    email: '',
    phone: '',
    address: '',
    about: '',
    facebook: '',
    twitter: '',
    linkedin: '',
    instagram: '',
    pintrest: '',
    youtube: '',
    meta_title: '',
    meta_keywords: '',
    meta_desc: '',
    meta_tags: '',
    head_tags: '',
    body_tags: ''
  };

  saving = false;
  loading = true;

  faviconPreview: string | null = null;
  mainLogoPreview: string | null = null;
  footerLogoPreview: string | null = null;

  faviconFile: File | null = null;
  mainLogoFile: File | null = null;
  footerLogoFile: File | null = null;

  constructor(
    private settingService: SettingService,
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.settingService.getSettings().subscribe({
      next: (res: any) => {
        console.log('Settings response:', res);

        if (res && res.success && res.data) {
          // Merge data with default settings
          this.settings = { ...this.settings, ...res.data };
          console.log('Settings after merge:', this.settings);

          // Set image previews from existing data
          this.setImagePreviews();
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Settings error:', err);
        this.toast.error('Error', 'Failed to load settings');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  setImagePreviews(): void {
    const baseUrl = 'http://localhost:8000/storage/settings/';

    if (this.settings.favicon && this.settings.favicon !== 'null') {
      this.faviconPreview = baseUrl + this.settings.favicon;
    }
    if (this.settings.main_logo && this.settings.main_logo !== 'null') {
      this.mainLogoPreview = baseUrl + this.settings.main_logo;
    }
    if (this.settings.footer_logo && this.settings.footer_logo !== 'null') {
      this.footerLogoPreview = baseUrl + this.settings.footer_logo;
    }

    this.cdr.detectChanges();
  }

  onFileChange(event: any, field: string): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      if (field === 'favicon') {
        this.faviconFile = file;
        this.faviconPreview = e.target.result;
      }
      if (field === 'main_logo') {
        this.mainLogoFile = file;
        this.mainLogoPreview = e.target.result;
      }
      if (field === 'footer_logo') {
        this.footerLogoFile = file;
        this.footerLogoPreview = e.target.result;
      }
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  saveSettings(): void {
    this.saving = true;
    this.cdr.detectChanges();

    const formData = new FormData();

    const fields = [
      'facebook', 'twitter', 'linkedin', 'instagram', 'pintrest', 'youtube',
      'email', 'about', 'site_title', 'meta_title', 'meta_tags', 'meta_desc',
      'meta_keywords', 'head_tags', 'body_tags', 'phone', 'address'
    ];

    fields.forEach(f => {
      if (this.settings[f]) {
        formData.append(f, this.settings[f]);
      }
    });

    if (this.faviconFile) formData.append('favicon', this.faviconFile);
    if (this.mainLogoFile) formData.append('main_logo', this.mainLogoFile);
    if (this.footerLogoFile) formData.append('footer_logo', this.footerLogoFile);

    this.settingService.saveSettings(formData).subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.toast.success('Success', 'Settings saved successfully!');
          this.loadSettings(); // Reload to refresh data
        } else {
          this.toast.error('Error', res?.message || 'Failed to save settings');
        }
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Save error:', err);
        this.toast.error('Error', err.error?.message || 'Failed to save settings');
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }
}
