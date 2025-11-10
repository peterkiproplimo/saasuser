import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Plan {
    name: string;
    plan_name: string;
    billing_interval: string;
    billing_interval_count: number;
    cost: number;
    currency: string;
    item: string;
    type: string;
    features: string[];
    application: {
        name: string;
        description: string;
        short_description: string;
        subdomain: string;
        app_logo?: string;
    };
}

export interface PlansResponse {
    status: number;
    message: string;
    data: Plan[];
    pagination: {
        page: number;
        page_size: number;
        total_records: number;
        total_pages: number;
    };
    filters: {
        application: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class PlansApiService {
    private baseUrl = 'https://saas.techsavanna.technology/api/method/saas.apis.subscription.list_plans';

    // Signals for reactive state management
    plans = signal<Plan[]>([]);
    isLoading = signal(false);
    error = signal<string | null>(null);

    constructor(private http: HttpClient) { }

    fetchPlans(application: string, page: number = 1, pageSize: number = 5): Observable<PlansResponse> {
        this.isLoading.set(true);
        this.error.set(null);

        const url = `${this.baseUrl}?application=${encodeURIComponent(application)}&page=${page}&page_size=${pageSize}&_t`;

        return this.http.get<PlansResponse>(url);
    }

    loadPlans(application: string, page: number = 1, pageSize: number = 5): void {
        this.fetchPlans(application, page, pageSize).subscribe({
            next: (response) => {
                this.plans.set(response.data);
                this.isLoading.set(false);
            },
            error: (error) => {
                // Extract detailed error message from API response
                let errorMessage = 'Failed to fetch plans';
                const errorCode = error?.status || 'Unknown';

                if (error?.error?.exception?.includes('ValidationError') ||
                    error?.error?.exception?.includes('No module named')) {
                    errorMessage = `Error 417: API not found. Check on frappe logs.`;
                } else if (error?.status === 417) {
                    errorMessage = `Error 417: API not found.`;
                } else if (error?.error?.message) {
                    errorMessage = `Error ${errorCode}: ${error.error.message}`;
                } else if (error?.error?.exc) {
                    const excMatch = error.error.exc.match(/ValidationError: (.+?)\\n/);
                    if (excMatch) {
                        errorMessage = `Error ${errorCode}: ${excMatch[1]}`;
                    } else {
                        errorMessage = `Error ${errorCode}: ${error.error.exc}`;
                    }
                } else if (error?.error?.exception) {
                    errorMessage = `Error ${errorCode}: ${error.error.exception}`;
                } else if (error?.message) {
                    errorMessage = `Error ${errorCode}: ${error.message}`;
                } else {
                    errorMessage = `Error ${errorCode}: Failed to fetch plans`;
                }

                this.error.set(errorMessage);
                this.isLoading.set(false);
            }
        });
    }
}
