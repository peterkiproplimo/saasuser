import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { SolutionCardComponent } from '../shared/components/solution-card/solution-card.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, SolutionCardComponent, RouterLink],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss'],
})
export class Landing implements OnInit {
  services: any[] = [];
  showVideoModal = false;
  videoUrl: SafeResourceUrl = '';

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.fetchSolutions();
  }

  fetchSolutions() {
    const url = `${environment.BASE_URL}.subscription.list_saas_application?page=1&page_size=10`;
    this.http.get<any>(url).subscribe({
      next: (res) => {
        if (res.status === 200) {
          this.services = res.data;
        }
      },
      error: (err) => {
        console.error('Error fetching SaaS applications:', err);
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
