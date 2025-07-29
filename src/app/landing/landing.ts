import { Component, OnInit } from '@angular/core';
import { SaasService } from './service/saas.service';
import { Service } from './models/service';
import { SolutionCard } from './components/solution-card/solution-card';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [SolutionCard],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing implements OnInit {
  services: Service[] = [];

  constructor(private saasService: SaasService) {}

  ngOnInit(): void {
    this.saasService.getSaasApplications(1, 100).subscribe((response) => {
      if (response?.status === 200) {
        this.services = response.data.map((item: any) => ({
          title: item.app_name,
          description:
            item.short_description ||
            item.description ||
            'No description available',
          icon: this.mapIcon(item.app_code),
        }));
        console.log(this.services); // ✅ Confirm it's not empty
      }
    });
  }

  trackByTitle(index: number, item: Service): string {
    return item.title;
  }

  private mapIcon(appCode: string): string {
    const lower = appCode.toLowerCase();
    if (lower.includes('pos')) return 'pi-credit-card';
    if (lower.includes('property')) return 'pi-building';
    if (lower.includes('crm')) return 'pi-chart-line';
    if (lower.includes('support')) return 'pi-headphones';
    if (lower.includes('inventory')) return 'pi-box';
    if (lower.includes('procure')) return 'pi-shopping-cart';
    if (lower.includes('account')) return 'pi-wallet';
    if (lower.includes('manufacture')) return 'pi-cog';
    if (lower.includes('project')) return 'pi-folder';
    if (lower.includes('asset')) return 'pi-desktop';
    if (lower.includes('attendance') || lower.includes('leave'))
      return 'pi-calendar-clock';
    if (lower.includes('payroll') || lower.includes('hr'))
      return 'pi-briefcase';
    if (lower.includes('learn')) return 'pi-book';
    if (lower.includes('web') || lower.includes('e-commerce'))
      return 'pi-globe';
    return 'pi-sliders-h'; // default icon
  }
}
