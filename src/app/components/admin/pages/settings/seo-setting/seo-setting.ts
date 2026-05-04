import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingService } from '../../../../../services/settings.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-seo-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seo-setting.html',
})
export class SeoSetting implements OnInit {
  seo: any = {};
  saving = false;
  loading = true;

  // Active tab
  activeTab = 'home';
  tabs = ['home', 'about', 'contact', 'service', 'course', 'faq'];

  constructor(private settingService: SettingService,      private cdr: ChangeDetectorRef
) {}

  ngOnInit(): void {
    this.loadSeoSettings();
  }

  loadSeoSettings(): void {
    this.loading = true;
    this.settingService.getSeoSettings().subscribe({
      next: (res: any) => {
        this.seo = res.data || {};
        this.loading = false;
          this.cdr.detectChanges();


      },
      error: () => { this.loading = false; }
    });
  }

  saveSeoSettings(): void {
    this.saving = true;
    this.settingService.saveSeoSettings(this.seo).subscribe({
      next: (res: any) => {
        this.seo = res.data;
        this.saving = false;
        alert('SEO settings saved successfully!');
      },
      error: () => {
        this.saving = false;
        alert('Failed to save SEO settings.');
      }
    });
  }
}
