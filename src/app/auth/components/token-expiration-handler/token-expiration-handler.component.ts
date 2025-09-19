import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { TokenService } from '../../services/token.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-token-expiration-handler',
    standalone: true,
    imports: [CommonModule, ToastModule],
    providers: [MessageService],
    template: `
    <p-toast></p-toast>
  `,
    styles: []
})
export class TokenExpirationHandlerComponent implements OnInit, OnDestroy {
    private tokenService = inject(TokenService);
    private messageService = inject(MessageService);
    private subscription?: Subscription;

    ngOnInit() {
        // Listen for token expiration events
        this.subscription = this.tokenService.tokenExpired$.subscribe(expired => {
            if (expired) {
                this.showExpirationMessage();
            }
        });
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    private showExpirationMessage() {
        this.messageService.add({
            severity: 'warn',
            summary: 'Session Expired',
            detail: 'Your session has expired. Please log in again.',
            life: 5000
        });
    }
}
