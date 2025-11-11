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

import { environment } from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PlansApiService {
    private baseUrl = environment.BASE_URL;

    // Signals for reactive state management
    plans = signal<Plan[]>([]);
    isLoading = signal(false);
    error = signal<string | null>(null);

    constructor(private http: HttpClient) { }

    fetchPlans(application: string): Observable<any> {
        this.isLoading.set(true);
        this.error.set(null);

        const url = `${this.baseUrl}.subscription.get_subscription_plans?application=${encodeURIComponent(application)}`;

        return this.http.get<any>(url);
    }

    loadPlans(application: string): void {
        this.fetchPlans(application).subscribe({
            next: (response) => {
                // Handle different response formats
                let plansData: Plan[] = [];

                if (response?.data && Array.isArray(response.data)) {
                    plansData = response.data;
                } else if (response?.message?.data && Array.isArray(response.message.data)) {
                    plansData = response.message.data;
                } else if (Array.isArray(response)) {
                    plansData = response;
                } else if (response?.plans && Array.isArray(response.plans)) {
                    plansData = response.plans;
                }

                this.plans.set(plansData);
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
