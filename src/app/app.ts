import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { TokenExpirationHandlerComponent } from './auth/components/token-expiration-handler/token-expiration-handler.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonModule, TokenExpirationHandlerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'saas-product';
}
