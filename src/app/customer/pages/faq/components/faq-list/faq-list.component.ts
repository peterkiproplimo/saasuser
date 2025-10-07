import { Component, computed, inject, signal } from '@angular/core';
import { ListFaqService } from '../../../../../faq/services/list-faq.service';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { Accordion } from 'primeng/accordion';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';
import { CustomerFaqPanelComponent } from '../faq-panel/faq-panel.component';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { ProgressSpinner } from 'primeng/progressspinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Toolbar } from 'primeng/toolbar';

@Component({
    selector: 'app-customer-faq-list',
    imports: [
        Accordion,
        EmptyStateComponent,
        CustomerFaqPanelComponent,
        IconField,
        InputIcon,
        InputText,
        Paginator,
        ProgressSpinner,
        ReactiveFormsModule,
        Toolbar,
        FormsModule
    ],
    templateUrl: './faq-list.component.html',
    styleUrl: './faq-list.component.scss'
})
export class CustomerFaqListComponent {
    private faqsService = inject(ListFaqService);

    pageNum = this.faqsService.page;
    pageSize = this.faqsService.page_size;
    first = signal<number>(0);

    new_faqs = this.faqsService.faqResource.value;
    is_loading = this.faqsService.faqResource.isLoading;

    search = this.faqsService.search_term;
    totalRecords = computed(() => this.new_faqs().pagination?.total_records ?? 0);

    onPageChange(event: PaginatorState) {
        this.first.set(event.first ?? 0);
        this.pageSize.set(event.rows ?? 5);
        this.pageNum.set((event.page ?? 0) + 1);
    }
}
