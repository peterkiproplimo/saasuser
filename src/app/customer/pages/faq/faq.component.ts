import { Component } from '@angular/core';
import { CustomerFaqListComponent } from './components/faq-list/faq-list.component';

@Component({
    selector: 'app-customer-faq',
    templateUrl: './faq.component.html',
    styleUrls: ['./faq.component.scss'],
    imports: [CustomerFaqListComponent]
})
export class CustomerFaqComponent {

}
