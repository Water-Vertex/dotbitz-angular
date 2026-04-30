import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SitemapService } from '../../../../../services/sitemap.service';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-sitemap',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './sitemap.html',
})
export class SitemapComponent implements OnInit {

  loading        = false;
  sitemapType: 'html' | 'xml' = 'html';

  staticPages: any[]                       = [];
  dynamicContent: { [key: string]: any[] } = {};
  allUrls: any[]                           = [];
  urlCounts: any                           = {
    static: 0, courses: 0, posts: 0, categories: 0, total: 0
  };
  lastGenerated = '';

  xmlContent = '';

  constructor(
    private sitemapService: SitemapService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSitemap();
  }

  loadSitemap(): void {
    this.loading = true;
    this.sitemapService.getSitemapData().subscribe({
      next: (res: any) => {
        this.staticPages    = res.staticPages   || [];
        this.dynamicContent = res.dynamicContent || {};
        this.allUrls        = res.allUrls        || [];
        this.urlCounts      = res.urlCounts      || {};
        this.lastGenerated  = res.lastGenerated  || '';
        this.buildXmlPreview();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; }
    });
  }

  buildXmlPreview(): void {
    let xml  = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    this.allUrls.forEach(url => {
      xml += `  <url>\n`;
      xml += `    <loc>${url.url}</loc>\n`;
      xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
      xml += `    <priority>${url.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += '</urlset>';
    this.xmlContent = xml;
  }

  getDynamicKeys(): string[] {
    return Object.keys(this.dynamicContent).filter(
      k => this.dynamicContent[k]?.length > 0
    );
  }

  downloadXml(): void {
    const token = localStorage.getItem('token') || '';
    const url   = `${environment.AdminApiUrl}/sitemap/download`;

    // Auth header ke saath download
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/xml',
      }
    })
    .then(res => res.blob())
    .then(blob => {
      const link    = document.createElement('a');
      link.href     = URL.createObjectURL(blob);
      link.download = 'sitemap.xml';
      link.click();
      URL.revokeObjectURL(link.href);
    })
    .catch(() => alert('Failed to download sitemap.'));
  }

  copyXml(): void {
    navigator.clipboard.writeText(this.xmlContent).then(
      () => alert('XML sitemap copied to clipboard!'),
      () => alert('Failed to copy.')
    );
  }

  getPublicXmlUrl(): string {
    return window.location.hostname === 'localhost'
      ? 'http://localhost:8000/sitemap.xml'
      : 'https://dotbitz.com/sitemap.xml';
  }

  getPriorityColor(priority: string): string {
    const p = parseFloat(priority);
    if (p >= 0.9) return 'bg-green-100 text-green-700';
    if (p >= 0.7) return 'bg-blue-100 text-blue-700';
    if (p >= 0.5) return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-600';
  }

  getFreqColor(freq: string): string {
    switch (freq) {
      case 'daily':   return 'bg-red-100 text-red-700';
      case 'weekly':  return 'bg-orange-100 text-orange-700';
      case 'monthly': return 'bg-blue-100 text-blue-700';
      case 'yearly':  return 'bg-gray-100 text-gray-600';
      default:        return 'bg-gray-100 text-gray-600';
    }
  }
}