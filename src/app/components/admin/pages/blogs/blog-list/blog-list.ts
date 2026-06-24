import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, filter } from 'rxjs';
import { BlogService } from '../../../../../services/blog.service';
import { ToastService } from '../../../../../services/toast.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './blog-list.html',
  styleUrls: ['./blog-list.css']
})
export class BlogList implements OnInit, OnDestroy {
  blogs: any[] = [];
  filteredBlogs: any[] = [];
  totalItems: number = 0;
  searchTerm: string = '';
  statusFilter: string = 'all';
  sortBy: string = 'newest';
  itemsPerPage: number = 10;
  isLoading: boolean = false;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private blogService: BlogService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public auth: AuthService
  ) {
    // Listen for navigation events to reload data when returning to this page
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: any) => {
      if (event.url === '/admin/blog/list' || event.url.includes('/admin/blog')) {
        console.log('Navigation detected, reloading blogs');
        setTimeout(() => {
          this.loadBlogs();
        }, 100);
      }
    });
  }

  ngOnInit(): void {
    console.log('Blog List Component initialized');
    this.loadBlogs();

    // Setup search with debounce
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.applyFilters();
    });
  }

  loadBlogs(): void {
    console.log('Loading blogs...');
    this.isLoading = true;
    this.cdr.detectChanges();

    this.blogService.getBlogs().pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('API Response:', response);

          // Extract data from response
          let blogData = [];
          if (response?.data && Array.isArray(response.data)) {
            blogData = response.data;
          } else if (response?.blogs && Array.isArray(response.blogs)) {
            blogData = response.blogs;
          } else if (Array.isArray(response)) {
            blogData = response;
          } else {
            blogData = [];
          }

          this.blogs = [...blogData];
          this.totalItems = this.blogs.length;
          console.log('Blogs loaded:', this.blogs.length, 'items');

          this.applyFilters();
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading blogs:', error);
          this.toastService.error('Error', 'Failed to load blogs. Please try again.');
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  applyFilters(): void {
    let filtered = [...this.blogs];

    // Apply search filter
    if (this.searchTerm && this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(blog =>
        blog.name?.toLowerCase().includes(term) ||
        blog.slug?.toLowerCase().includes(term) ||
        blog.meta_description?.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(blog => blog.status === this.statusFilter);
    }

    // Apply sorting
    filtered = this.sortBlogs(filtered);

    // Apply pagination
    this.filteredBlogs = filtered.slice(0, this.itemsPerPage);
    this.totalItems = filtered.length;

    this.cdr.detectChanges();
  }

  sortBlogs(blogs: any[]): any[] {
    switch (this.sortBy) {
      case 'newest':
        return blogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'oldest':
        return blogs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'title_asc':
        return blogs.sort((a, b) => a.name?.localeCompare(b.name));
      case 'title_desc':
        return blogs.sort((a, b) => b.name?.localeCompare(a.name));
      default:
        return blogs;
    }
  }

  changeItemsPerPage(): void {
    this.applyFilters();
  }

  can(permission: string): boolean {
    return this.auth.hasPermission(permission);
  }

  refreshData(): void {
    console.log('Manual refresh triggered');
    this.loadBlogs();
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  editBlog(id: number): void {
    this.router.navigate(['/admin/blog/edit', id]);
  }

  deleteBlog(id: number): void {
    if (confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      console.log('Deleting blog ID:', id);

      // Optimistically remove from UI
      const index = this.blogs.findIndex(blog => blog.id === id);
      if (index !== -1) {
        this.blogs.splice(index, 1);
        this.applyFilters();
        this.cdr.detectChanges();
      }

      this.blogService.deleteBlog(id).subscribe({
        next: (response: any) => {
          console.log('Delete successful:', response);
          this.toastService.success('Success', response?.message || 'Blog post deleted successfully!');
          this.loadBlogs(); // Reload to ensure sync with server
        },
        error: (error) => {
          console.error('Delete error:', error);
          this.toastService.error('Error', 'Failed to delete blog post. Please try again.');
          this.loadBlogs(); // Reload to revert optimistic update
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackById(index: number, blog: any): number {
    return blog.id;
  }
}
