import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface Solution {
    name: string;
    app_name: string;
    app_code: string;
    app_logo: string;
    description: string;
    short_description: string;
    features: string[];
    creation: string;
    modified: string;
    owner: string;
}

export interface SolutionsResponse {
    status: number;
    message: string;
    data: Solution[];
    pagination: {
        page: number;
        page_size: number;
        total_records: number;
        total_pages: number;
    };
}

@Injectable({
    providedIn: 'root'
})
export class SolutionsApiService {
    private baseUrl = `${environment.BASE_URL}.subscription.list_saas_application`;

    // Signals for reactive state management
    solutions = signal<Solution[]>([]);
    isLoading = signal(false);
    error = signal<string | null>(null);

    constructor(private http: HttpClient) { }

    fetchSolutions(page: number = 1, pageSize: number = 10): Observable<SolutionsResponse> {
        this.isLoading.set(true);
        this.error.set(null);

        const url = `${this.baseUrl}?page=${page}&page_size=${pageSize}`;

        return this.http.get<SolutionsResponse>(url);
    }

    loadSolutions(page: number = 1, pageSize: number = 10): void {
        this.fetchSolutions(page, pageSize).subscribe({
            next: (response) => {
                this.solutions.set(response.data);
                this.isLoading.set(false);
            },
            error: (error) => {
                this.error.set(error.message || 'Failed to fetch solutions');
                this.isLoading.set(false);
            }
        });
    }
}
