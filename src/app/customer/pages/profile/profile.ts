import {Component} from '@angular/core';
import {User} from '../../../auth/models/responses/login-response';
import {FormsModule} from '@angular/forms';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [
    FormsModule,
    DatePipe
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile {

  user :User = JSON.parse(localStorage.getItem('user')!);

}
