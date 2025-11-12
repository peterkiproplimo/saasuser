import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

export interface CreateSubscriptionRequest {
    plan: string;
    subdomain: string;
}

export interface CreateSubscriptionResponse {
    status: number;
    message: string;
    data: {
        name: string;
        company: string;
        party_type: string;
        party: string;
        start_date: string;
        status: string;
        custom_subdomain: string;
        plans: Array<{
            plan: string;
            qty: number;
            name: string;
            idx: number;
        }>;
        creation: string;
        invoice: {
            name: string;
            grand_total: number;
            status: string;
            currency: string;
            posting_date: string;
            due_date: string;
            outstanding_amount: number;
            billing_period: {
                start_date: string;
                end_date: string;
            };
            billing_interval: {
                interval: string;
                interval_count: number;
            };
        };
    };
}

@Injectable({
    providedIn: 'root'
})
export class SubscriptionCreationService {
    private baseUrl = `${environment.BASE_URL}.subscription.create_subscription`;

    // Signals for reactive state management
    isLoading = signal(false);
    error = signal<string | null>(null);
    createdSubscription = signal<any>(null);

    constructor(private http: HttpClient) { }

    createSubscription(request: CreateSubscriptionRequest): Observable<CreateSubscriptionResponse> {
        this.isLoading.set(true);
        this.error.set(null);

        return this.http.post<CreateSubscriptionResponse>(this.baseUrl, request);
    }

    submitSubscription(request: CreateSubscriptionRequest): void {
        this.createSubscription(request).subscribe({
            next: (response) => {
                this.createdSubscription.set(response.data);
                this.isLoading.set(false);
            },
            error: (error) => {
                this.error.set(error.message || 'Failed to create subscription');
                this.isLoading.set(false);
            }
        });
    }
}
