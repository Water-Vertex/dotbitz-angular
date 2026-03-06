import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule], // ✅ add HttpClientModule
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit, OnDestroy {
  // State variables
  page: string = 'ecommerce';
  loaded: boolean = true;
  darkMode: boolean = false;
  stickyMenu: boolean = false;
  sidebarToggle: boolean = false;
  scrollTop: boolean = false;

  // Menu state
  selectedMenu: string = 'Dashboard';

  // Mobile menu state
  menuToggle: boolean = false;

  // Notification state
  notificationDropdownOpen: boolean = false;
  notifying: boolean = true;

  // User dropdown state
  userDropdownOpen: boolean = false;

  // Chart dropdown states
  chartDropdownOpen: boolean = false;
  chartSelected: string = 'overview';

  constructor(private router: Router) {}

  ngOnInit() {
    // Initialize from localStorage
    const savedDarkMode = localStorage.getItem('darkMode');
    this.darkMode = savedDarkMode ? JSON.parse(savedDarkMode) : false;

    const savedSelected = localStorage.getItem('selectedMenu');
    this.selectedMenu = savedSelected || 'Dashboard';

    const savedSidebarState = localStorage.getItem('sidebarCollapsed');
    this.sidebarToggle = savedSidebarState === 'true';

    // Hide preloader after load
    setTimeout(() => {
      this.loaded = false;
    }, 500);

    // Watch for route changes to update page
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects || event.url;
        this.updatePageFromUrl(url);
      });

    // Initialize page from current URL
    this.updatePageFromUrl(this.router.url);

    // Listen for scroll events
    window.addEventListener('scroll', this.handleScroll);
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  private handleScroll = () => {
    this.stickyMenu = window.scrollY > 100;
    this.scrollTop = window.scrollY > 400;
  }

  updatePageFromUrl(url: string) {
    if (url.includes('analytics')) this.page = 'analytics';
    else if (url.includes('marketing')) this.page = 'marketing';
    else if (url.includes('crm')) this.page = 'crm';
    else if (url.includes('stocks')) this.page = 'stocks';
    else if (url.includes('saas')) this.page = 'saas';
    else if (url.includes('logistics')) this.page = 'logistics';
    else if (url.includes('calendar')) this.page = 'calendar';
    else if (url.includes('profile')) this.page = 'profile';
    else if (url.includes('chat')) this.page = 'chat';
    else this.page = 'ecommerce';
  }

  // Toggle methods
  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', JSON.stringify(this.darkMode));

    if (this.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  toggleSidebar() {
    this.sidebarToggle = !this.sidebarToggle;
    localStorage.setItem('sidebarCollapsed', JSON.stringify(this.sidebarToggle));
  }

  toggleMenu(menuName: string) {
    if (this.selectedMenu === menuName) {
      this.selectedMenu = '';
    } else {
      this.selectedMenu = menuName;
    }
    localStorage.setItem('selectedMenu', this.selectedMenu);
  }

  toggleMobileMenu() {
    this.menuToggle = !this.menuToggle;
  }

  toggleNotificationDropdown() {
    this.notificationDropdownOpen = !this.notificationDropdownOpen;
    if (this.notificationDropdownOpen) {
      this.notifying = false;
    }
  }

  toggleUserDropdown() {
    this.userDropdownOpen = !this.userDropdownOpen;
  }

  toggleChartDropdown() {
    this.chartDropdownOpen = !this.chartDropdownOpen;
  }

  selectChartOption(option: string) {
    this.chartSelected = option;
  }

  // Check if menu is active
  isMenuActive(menuName: string): boolean {
    return this.selectedMenu === menuName;
  }

  // Check if page is active
  isPageActive(pageName: string): boolean {
    return this.page === pageName;
  }

  // Check if any dashboard page is active
  isDashboardActive(): boolean {
    return [
      'ecommerce', 'analytics', 'marketing', 'crm', 'stocks', 'saas', 'logistics'
    ].includes(this.page);
  }

  // Close all dropdowns
  closeAllDropdowns() {
    this.notificationDropdownOpen = false;
    this.userDropdownOpen = false;
    this.chartDropdownOpen = false;
  }

  // Scroll to top
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
