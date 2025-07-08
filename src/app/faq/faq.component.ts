import {Component} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms'
import {ProgressSpinner} from 'primeng/progressspinner';
import {Toast} from 'primeng/toast';
import {Dialog} from 'primeng/dialog';
import {ReactiveInputComponent} from '../shared/components/form/reactive-input/reactive-input.component';
import {ConfirmationService, MessageService} from 'primeng/api';
import {ReactiveTextAreaComponent} from '../shared/components/form/reactive-text-area/reactive-text-area.component';
import {FaqListComponent} from './components/faq-list/faq-list.component';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
  providers: [MessageService, ConfirmationService],
  imports: [
    ReactiveFormsModule,
    FormsModule,
    FaqListComponent
  ]
})
export class FaqComponent {

}
