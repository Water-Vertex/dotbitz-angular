import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingService } from '../../../../../services/settings.service';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './setting.html',
})
export class Setting implements OnInit {
  settings: any = {};
  saving = false;
  loading = true;

  // File previews
  faviconPreview: string | null = null;
  mainLogoPreview: string | null = null;
  footerLogoPreview: string | null = null;

  // File objects
  faviconFile: File | null = null;
  mainLogoFile: File | null = null;
  footerLogoFile: File | null = null;

  constructor(private settingService: SettingService,
      private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  // loadSettings(): void {
  //   this.loading = true;
  //   this.settingService.getSettings().subscribe({
  //     next: (res: any) => {
  //       this.settings = res.data || {};
  //       // Set existing image previews
  //       if (this.settings.favicon)
  //         this.faviconPreview = `http://localhost:8000/assets/settings/${this.settings.favicon}`;
  //       if (this.settings.main_logo)
  //         this.mainLogoPreview = `http://localhost:8000/assets/settings/${this.settings.main_logo}`;
  //       if (this.settings.footer_logo)
  //         this.footerLogoPreview = `http://localhost:8000/assets/settings/${this.settings.footer_logo}`;
  //       this.loading = false;
  //     },
  //     error: () => { this.loading = false; }
  //   });
  // }
  loadSettings(): void {
  this.loading = true;
  this.settingService.getSettings().subscribe({
    next: (res: any) => {
      console.log('Settings response:', res); // ✅ add karo
        this.loading = false;
  console.log('Loading:', this.loading); // add karo
  this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Settings error:', err); // ✅ add karo
      this.loading = false;
        this.cdr.detectChanges();

    }
  });
}

  onFileChange(event: any, field: string): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      if (field === 'favicon') { this.faviconFile = file; this.faviconPreview = e.target.result; }
      if (field === 'main_logo') { this.mainLogoFile = file; this.mainLogoPreview = e.target.result; }
      if (field === 'footer_logo') { this.footerLogoFile = file; this.footerLogoPreview = e.target.result; }
    };
    reader.readAsDataURL(file);
  }

  saveSettings(): void {
    this.saving = true;
    const formData = new FormData();

    const fields = [
      'facebook', 'twitter', 'linkedin', 'instagram', 'pintrest', 'youtube',
      'email', 'about', 'site_title', 'meta_title', 'meta_tags', 'meta_desc',
      'meta_keywords', 'head_tags', 'body_tags', 'phone', 'address'
    ];

    fields.forEach(f => { if (this.settings[f]) formData.append(f, this.settings[f]); });

    if (this.faviconFile) formData.append('favicon', this.faviconFile);
    if (this.mainLogoFile) formData.append('main_logo', this.mainLogoFile);
    if (this.footerLogoFile) formData.append('footer_logo', this.footerLogoFile);

    this.settingService.saveSettings(formData).subscribe({
      next: (res: any) => {
        this.settings = res.data;
        this.saving = false;
        alert('Settings saved successfully!');
      },
      error: () => {
        this.saving = false;
        alert('Failed to save settings.');
      }
    });
  }
}
