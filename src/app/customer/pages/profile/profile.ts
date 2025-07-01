import {Component, signal} from '@angular/core';
import {User} from '../../../auth/models/responses/login-response';
import {Button} from 'primeng/button';
import {InputText} from 'primeng/inputtext';
import {FormsModule} from '@angular/forms';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [
    Button,
    InputText,
    FormsModule,
    DatePipe
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile {

  user :User = JSON.parse(localStorage.getItem('user')!);

  isEditing = signal<boolean>(false);
  editUser: User = {};

  toggleEdit() {
    this.isEditing.set(!this.isEditing());
    if (this.isEditing()) {
      this.resetEditForm();
    }
  }

  resetEditForm() {

  }

  saveProfile() {
    this.isEditing.set(false);
  }

}
