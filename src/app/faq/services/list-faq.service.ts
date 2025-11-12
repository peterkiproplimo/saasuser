import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ListFaqResponse } from '../models/responses/list-faq-response';
import { debounceSignal } from '../../shared/functions/functions';

@Injectable({
  providedIn: 'root'
})
export class ListFaqService {

  base_url: string = environment.BASE_URL;
  http = inject(HttpClient);

  page = signal(1);
  page_size = signal(5);
  search_term = signal('');

  debounced_search = debounceSignal<string>(this.search_term, 500);


  faqResource = httpResource<ListFaqResponse>(
    () => `${this.base_url}.faqs.list_faqs?page=${this.page()}&page_size=${this.page_size()}&search=${this.debounced_search()}`,
    { defaultValue: {} }
  )


}

