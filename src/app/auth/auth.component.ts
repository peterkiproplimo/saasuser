import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {ProgressSpinner} from 'primeng/progressspinner';
import {ReactiveInputComponent} from '../shared/components/form/reactive-input/reactive-input.component';
import {Toast} from 'primeng/toast';
import {MessageService} from 'primeng/api';

@Component({
  selector: 'app-auth',
  imports: [
    RouterOutlet,
    FormsModule,
    Toast
  ],
  providers: [MessageService],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {

}
