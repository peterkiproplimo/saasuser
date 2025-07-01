import {Component, input} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {Plan} from '../../models/responses/list-plan-response';

@Component({
  selector: 'app-plan-card',
  imports: [
    DecimalPipe
  ],
  templateUrl: './plan-card.html',
  styleUrl: './plan-card.scss'
})
export class PlanCard {

  plan = input<Plan>()

}
