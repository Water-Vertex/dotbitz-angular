// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';
// import { FormsModule } from '@angular/forms';
// import { McqService } from '../../../../../services/mcq.service';
// import { Mcq } from '../../../../../models/mcq.model';

// @Component({
//   selector: 'app-mcqs-list',
//   standalone: true,
//   imports: [CommonModule, RouterModule, FormsModule],
//   templateUrl: './mcqs-list.html',
//   styleUrls: ['./mcqs-list.css']
// })
// export class McqsList implements OnInit {
//   mcqs: Mcq[] = [];
//   filteredMcqs: Mcq[] = [];
//   searchText: string = '';
//   loading = false;

//   constructor(private mcqService: McqService) {}

//   ngOnInit() {
//     console.log('🚀 MCQ List Component Initialized');
//     this.loadMcqs();
//   }

//   loadMcqs() {
//     console.log('📥 Loading MCQs from API...');
//     this.loading = true;
    
//     // Set timeout to prevent infinite loading
//     const timeoutId = setTimeout(() => {
//       if (this.loading) {
//         console.error('⏱️ Request timed out after 30 seconds');
//         this.loading = false;
//         alert('Request timed out. Please check your server.');
//       }
//     }, 30000); // 30 seconds timeout
    
//     this.mcqService.getAllMcqs().subscribe({
//       next: (data) => {
//         clearTimeout(timeoutId);
//         console.log('✅ MCQs received:', data);
//         console.log('📊 Total MCQs:', data.length);
        
//         if (Array.isArray(data)) {
//           this.mcqs = data;
//           this.filteredMcqs = data;
//           console.log('✅ MCQs assigned to component');
//         } else {
//           console.error('❌ Response is not an array:', data);
//           this.mcqs = [];
//           this.filteredMcqs = [];
//         }
        
//         this.loading = false;
//       },
//       error: (err) => {
//         clearTimeout(timeoutId);
//         console.error('❌ Error loading MCQs:', err);
//         console.error('Error status:', err.status);
//         console.error('Error message:', err.message);
//         console.error('Full error:', err);
        
//         this.loading = false;
//         this.mcqs = [];
//         this.filteredMcqs = [];
        
//         // Better error message
//         let errorMsg = 'Failed to load MCQs. ';
//         if (err.status === 0) {
//           errorMsg += 'Cannot connect to server. Is Laravel running on port 8000?';
//         } else if (err.status === 401) {
//           errorMsg += 'Unauthorized. Please login again.';
//         } else if (err.status === 500) {
//           errorMsg += 'Server error. Check Laravel logs.';
//         } else {
//           errorMsg += `Error: ${err.message}`;
//         }
        
//         alert(errorMsg);
//       },
//       complete: () => {
//         console.log('🏁 MCQ loading completed');
//       }
//     });
//   }

//   onSearch() {
//     if (!this.searchText.trim()) {
//       this.filteredMcqs = this.mcqs;
//       return;
//     }

//     const search = this.searchText.toLowerCase();
//     this.filteredMcqs = this.mcqs.filter(mcq => 
//       mcq.question.toLowerCase().includes(search) ||
//       mcq.course?.course_name?.toLowerCase().includes(search) ||
//       mcq.status.toLowerCase().includes(search)
//     );
    
//     console.log(`🔍 Search results: ${this.filteredMcqs.length} / ${this.mcqs.length}`);
//   }

//   deleteMcq(id: number) {
//     if (confirm('Are you sure you want to delete this MCQ?')) {
//       this.mcqService.deleteMcq(id).subscribe({
//         next: () => {
//           console.log('✅ MCQ deleted successfully');
//           this.loadMcqs();
//           alert('MCQ deleted successfully!');
//         },
//         error: (err) => {
//           console.error('❌ Error deleting MCQ:', err);
//           alert('Failed to delete MCQ');
//         }
//       });
//     }
//   }
// }

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { McqService } from '../../../../../services/mcq.service';
import { Mcq } from '../../../../../models/mcq.model';
import { Course } from '../../../../../models/course.model';

@Component({
  selector: 'app-mcqs-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mcqs-list.html',
  
  styleUrls: ['./mcqs-list.css']
})
export class McqsList implements OnInit {

  mcqs: Mcq[] = [];
  filteredMcqs: Mcq[] = [];
  courses: Course[] = [];
  selectedCourseId: number | 'all' = 'all';
  searchText = '';
  loading = true;

  constructor(
    private mcqService: McqService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('🚀 MCQ List Component Initialized');
    this.loadMcqs();
    this.loadCourses(); // 🔥 NEW

  }

  loadCourses(): void {
  this.mcqService.getAllCourses().subscribe({
    next: (data) => {
      this.courses = data;
    },
    error: () => {
      this.courses = [];
    }
  });
}

  loadMcqs(): void {
    console.log('📥 Loading MCQs from API...');
    this.loading = true;

    this.mcqService.getAllMcqs().subscribe({
      next: (data: Mcq[]) => {
        console.log('✅ MCQs received:', data);

        this.mcqs = Array.isArray(data) ? data : [];
        this.filteredMcqs = [...this.mcqs]; // 🔥 IMPORTANT

        console.log('📊 Total MCQs:', this.mcqs.length);
      },
      error: (err) => {
        console.error('❌ Error loading MCQs:', err);
        this.mcqs = [];
        this.filteredMcqs = [];
      },
      complete: () => {
        this.loading = false;
        this.cdr.detectChanges(); // 🔥 THIS FIXES UI FREEZE
        console.log('🏁 MCQ loading completed');
      }
    });
  }

  onCourseChange(): void {
  if (!this.selectedCourseId) {
    // All courses
    this.filteredMcqs = [...this.mcqs];
    return;
  }

  this.filteredMcqs = this.mcqs.filter(
    mcq => mcq.course_id === Number(this.selectedCourseId)
  );
}

  get groupedMcqs() {
  const groups: { courseName: string, mcqs: Mcq[] }[] = [];
  const map = new Map<string, Mcq[]>();

  for (const mcq of this.filteredMcqs) {
    const courseName = mcq.course?.course_name || 'No Course';
    if (!map.has(courseName)) map.set(courseName, []);
    map.get(courseName)!.push(mcq);
  }

  for (const [courseName, mcqs] of map.entries()) {
    groups.push({ courseName, mcqs });
  }

  return groups;
}


  // onSearch(): void {
  //   const search = this.searchText.trim().toLowerCase();

  //   if (!search) {
  //     this.filteredMcqs = [...this.mcqs];
  //     return;
  //   }

  //   this.filteredMcqs = this.mcqs.filter(mcq =>
  //     mcq.question?.toLowerCase().includes(search) ||
  //     mcq.course?.course_name?.toLowerCase().includes(search) ||
  //     mcq.status?.toLowerCase().includes(search)
  //   );
  // }
  onSearch(): void {
  const search = this.searchText.trim().toLowerCase();

  let baseList = this.mcqs;

  if (this.selectedCourseId) {
    baseList = baseList.filter(
      mcq => mcq.course_id === Number(this.selectedCourseId)
    );
  }

  if (!search) {
    this.filteredMcqs = [...baseList];
    return;
  }

  this.filteredMcqs = baseList.filter(mcq =>
    mcq.question?.toLowerCase().includes(search) ||
    mcq.status?.toLowerCase().includes(search)
  );
}


  deleteMcq(id: number): void {
    if (!confirm('Are you sure you want to delete this MCQ?')) return;

    this.mcqService.deleteMcq(id).subscribe({
      next: () => this.loadMcqs(),
      error: () => alert('Failed to delete MCQ')
    });
  }

  trackById(index: number, item: Mcq): number {
    return item.msq_id!;
  }
}
