import { Component } from '@angular/core';
import {Service} from './models/service';
import {SolutionCard} from './components/solution-card/solution-card';

@Component({
  selector: 'app-landing',
  imports: [
    SolutionCard
  ],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class Landing {

  services: Service[] = [
    {
      title: "Point of Sale (POS)",
      description: "Fast, reliable retail management with real-time inventory sync and multi-location support.",
      icon: "pi-credit-card",
    },
    {
      title: "Property Management (PMS)",
      description: "Complete suite for bookings, housekeeping, billing, guest experience, agents, and rentals.",
      icon: "pi-building",
    },
    {
      title: "Customer Relationship Management (CRM)",
      description: "Drive sales with smart lead tracking and customer communication tools.",
      icon: "pi-chart-line",
    },
    {
      title: "Helpdesk & Support",
      description: "Support ticketing system and integrated knowledge base.",
      icon: "pi-headphones",
    },
    {
      title: "Inventory Management",
      description: "Track stock in real time with batch control and warehouse sync.",
      icon: "pi-box",
    },
    {
      title: "Procurement",
      description: "Manage supplier quotes, purchase orders, and vendor relationships.",
      icon: "pi-shopping-cart",
    },
    {
      title: "Accounting",
      description: "Automate your ledgers, invoicing, and reconciliation effortlessly.",
      icon: "pi-wallet",
    },
    {
      title: "Manufacturing",
      description: "Plan production, manage BOMs, and monitor work orders in real time.",
      icon: "pi-cog",
    },
    {
      title: "Project Management",
      description: "Track tasks, timesheets, and milestones across all teams.",
      icon: "pi-folder",
    },
    {
      title: "Asset Management",
      description: "Monitor assets, depreciation, and lifecycle across departments.",
      icon: "pi-desktop",
    },
    {
      title: "Attendance & Leave",
      description: "Track time, attendance, and automate leave approvals.",
      icon: "pi-calendar-clock",
    },
    {
      title: "HR & Payroll",
      description: "Centralized records, salary processing, compliance, and benefits.",
      icon: "pi-briefcase",
    },
    {
      title: "Learning Management",
      description: "Online courses, quizzes, and learner progress tracking built-in.",
      icon: "pi pi-book",
    },
    {
      title: "Website & E-Commerce",
      description: "Manage your website and online store from one dashboard.",
      icon: "pi-globe",
    },
    {
      title: "Bespoke Systems Development",
      description: "Custom solutions built around your workflows and operations.",
      icon: "pi-sliders-h",
    },
  ];

}
