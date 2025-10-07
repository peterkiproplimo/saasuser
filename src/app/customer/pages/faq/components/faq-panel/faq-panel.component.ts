import { Component, input, InputSignal } from '@angular/core';
import { AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';

@Component({
    selector: 'app-customer-faq-panel',
    imports: [
        AccordionPanel,
        AccordionHeader,
        AccordionContent
    ],
    templateUrl: './faq-panel.component.html',
    styleUrl: './faq-panel.component.scss'
})
export class CustomerFaqPanelComponent {
    faq: InputSignal<any> = input<any>()
}
