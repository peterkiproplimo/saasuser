import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { SolutionCardComponent } from '../shared/components/solution-card/solution-card.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { filter, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, SolutionCardComponent, RouterLink],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss'],
})
export class Landing implements OnInit, AfterViewInit, OnDestroy {
  private http = inject(HttpClient);
  private router = inject(Router);
  private destroy = inject(DestroyRef);
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);

  services: any[] = [];
  isLoading = true;
  showVideoModal = false;
  videoUrl: SafeResourceUrl = '';

  constructor() {
    // Listen for navigation to home route and fetch solutions
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroy)
      )
      .subscribe((event: NavigationEnd) => {
        if (event.url === '/' || event.urlAfterRedirects === '/') {
          // Only fetch if we don't have services yet
          if (this.services.length === 0) {
            this.fetchSolutions();
          }
        }
      });
  }

  ngOnInit(): void {
    // Fetch immediately on init
    this.fetchSolutions();
  }

  ngAfterViewInit(): void {
    // Ensure change detection runs after view init
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    // Cleanup handled by takeUntilDestroyed
  }

  fetchSolutions() {
    // Always set loading when fetching
    this.isLoading = true;

    const url = `${environment.BASE_URL}.subscription.list_saas_application?page=1&page_size=10`;
    this.http.get<any>(url).subscribe({
      next: (res) => {
        console.log('API Response:', res); // Debug log

        // Handle different response structures - Frappe API typically returns { message: { data: [...] } }
        let fetchedServices: any[] = [];

        // Try most common Frappe response structure first
        if (res.message && res.message.data && Array.isArray(res.message.data)) {
          fetchedServices = res.message.data;
        }
        // Try direct data property
        else if (res.data && Array.isArray(res.data)) {
          fetchedServices = res.data;
        }
        // Try status 200 with data
        else if (res.status === 200 && res.data && Array.isArray(res.data)) {
          fetchedServices = res.data;
        }
        // Try if response is directly an array
        else if (Array.isArray(res)) {
          fetchedServices = res;
        }
        // Try message as direct array
        else if (res.message && Array.isArray(res.message)) {
          fetchedServices = res.message;
        }

        console.log('Parsed services:', fetchedServices); // Debug log

        // Update services and loading state
        this.services = fetchedServices;
        this.isLoading = false;

        // Force change detection
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching SaaS applications:', err);
        this.isLoading = false;
        this.services = [];
        // Force change detection even on error
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
    });
  }

  trackByTitle(index: number, item: any): string {
    return item.name;
  }

  openVideoModal() {
    const youtubeUrl = 'https://www.youtube.com/embed/3Tmk6cE97K8';
    this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(youtubeUrl);
    this.showVideoModal = true;
  }

  closeVideoModal() {
    this.showVideoModal = false;
    this.videoUrl = '';
  }
}
