import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProgramaticSeoService, ProgramaticSeo } from '../../../../../../services/programatic-seo.service';
import { ToastService } from '../../../../../../services/toast.service';
@Component({
  selector: 'app-programatic-seo-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './programatic-seo-view.html',
  styleUrls: ['./programatic-seo-view.css'],
})
export class ProgramaticSeoView implements OnInit {
  record: ProgramaticSeo | null = null;
  loading = true;
  faqsArray: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private programaticSeoService: ProgramaticSeoService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id && id !== 'undefined' && id !== 'null') {
      this.loadRecord(Number(id));
    } else {
      this.toast.error('Error', 'Invalid record ID');
      this.loading = false;
      this.goBack();
    }
  }

  loadRecord(id: number): void {
    this.loading = true;
    this.cdr.detectChanges();
    
    this.programaticSeoService.getById(id).subscribe({
      next: (response) => {
        if (response && response.success && response.data) {
          this.record = response.data;
          this.parseFaqsSafely();
          this.loading = false;
          this.cdr.detectChanges();
        } else {
          this.toast.error('Not Found', 'Record not found');
          this.loading = false;
          setTimeout(() => this.goBack(), 2000);
        }
      },
      error: (error) => {
        console.error('Error loading record:', error);
        this.toast.error('Error', 'Failed to load record');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  parseFaqsSafely(): void {
    try {
      this.faqsArray = [];
      
      if (!this.record?.faqs) {
        return;
      }
      
      let faqsString = this.record.faqs;
      console.log('Raw FAQs:', faqsString);
      
      // If it's already an array
      if (Array.isArray(faqsString)) {
        this.faqsArray = faqsString;
        return;
      }
      
      // If it's a string
      if (typeof faqsString === 'string') {
        let cleaned = faqsString.trim();
        
        // Case: Multiple objects without outer array like: {...},{...}
        if (cleaned.startsWith('{') && !cleaned.startsWith('[')) {
          // Wrap in array
          cleaned = '[' + cleaned + ']';
        }
        
        // Fix: Replace }{ with },{
        cleaned = cleaned.replace(/\}\s*\{/g, '},{');
        
        // Ensure proper array format
        if (!cleaned.startsWith('[')) {
          cleaned = '[' + cleaned + ']';
        }
        
        try {
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed)) {
            this.faqsArray = parsed;
          } else if (parsed && typeof parsed === 'object') {
            this.faqsArray = [parsed];
          }
        } catch (e) {
          console.log('JSON parse failed, trying manual extraction');
          // Manual extraction for format: {"question": "...", "answer": "..."}
          const matches = cleaned.match(/\{"question":\s*"([^"]+)",\s*"answer":\s*"([^"]+)"\}/g);
          if (matches) {
            this.faqsArray = matches.map(match => {
              const qMatch = match.match(/"question":\s*"([^"]+)"/);
              const aMatch = match.match(/"answer":\s*"([^"]+)"/);
              return {
                question: qMatch ? qMatch[1] : 'Question',
                answer: aMatch ? aMatch[1] : 'Answer'
              };
            });
          }
        }
      }
      
      // Clean up any remaining JSON artifacts
      this.faqsArray = this.faqsArray.map(faq => ({
        question: this.cleanText(faq.question || faq.Q || 'Question'),
        answer: this.cleanText(faq.answer || faq.A || faq.Answer || '')
      }));
      
      console.log('Parsed FAQs:', this.faqsArray);
      this.cdr.detectChanges();
      
    } catch (error) {
      console.error('FAQ parsing error:', error);
      this.faqsArray = [];
      this.cdr.detectChanges();
    }
  }

  cleanText(text: string): string {
    if (!text) return '';
    // Remove any JSON artifacts, quotes, brackets
    let cleaned = text
      .replace(/[{}"\[\]]/g, '')
      .replace(/\\/g, '')
      .replace(/question:/gi, '')
      .replace(/answer:/gi, '')
      .trim();
    return cleaned;
  }

  goBack(): void {
    this.router.navigate(['/admin/programatic-seo']);
  }

  editRecord(): void {
    if (this.record && this.record.id) {
      this.router.navigate(['/admin/programatic-seo/edit', this.record.id]);
    }
  }
}