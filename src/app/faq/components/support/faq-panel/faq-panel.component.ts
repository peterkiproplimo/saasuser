import {Component, input, InputSignal} from '@angular/core';
import {AccordionContent, AccordionHeader, AccordionPanel} from 'primeng/accordion';
@Component({
  selector: 'app-faq-panel',
  imports: [
    AccordionPanel,
    AccordionHeader,
    AccordionContent
  ],
  templateUrl: './faq-panel.component.html',
  styleUrl: './faq-panel.component.scss'
})
export class FaqPanelComponent {

  faq : InputSignal<any> = input<any>()

}
