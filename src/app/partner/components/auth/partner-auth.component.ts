import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-partner-auth',
  imports: [RouterOutlet, Toast],
  providers: [MessageService],
  template: `
    <div class="flex h-screen w-full bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <!-- Left Side -->
      <div
        class="w-full lg:w-1/2 relative flex items-center justify-center overflow-hidden shadow-lg rounded-b-3xl lg:rounded-tr-3xl lg:rounded-br-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900"
      >
        <!-- Decorative Elements -->
        <div class="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-slate-600/20"></div>
        <div class="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full -translate-y-48 translate-x-48"></div>
        <div class="absolute bottom-0 left-0 w-80 h-80 bg-slate-400/10 rounded-full translate-y-40 -translate-x-40"></div>
        
        <!-- Animated Welcome Text -->
        <div class="relative z-20 px-3 sm:px-4 lg:px-6 text-center max-w-lg">
          <h3 class="text-white text-sm sm:text-base lg:text-lg xl:text-xl font-light leading-relaxed mb-3 sm:mb-4">
            Welcome to
            <span class="text-blue-200 font-bold">Techsavanna Partner Portal</span>
          </h3>
          <p class="text-blue-100 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
            Join our partner program and start offering your SaaS products to customers. 
            Manage your products, track subscriptions, and grow your business with 
            <span class="text-blue-200 font-semibold">Techsavanna</span>.
          </p>
          
          <!-- Feature Icons -->
          <div class="grid grid-cols-2 gap-2 sm:gap-3 max-w-sm mx-auto">
            <div class="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center">
              <div class="w-6 h-6 sm:w-8 sm:h-8 bg-blue-400 rounded-full mx-auto mb-1 sm:mb-2 flex items-center justify-center">
                <i class="pi pi-box text-white text-xs sm:text-sm"></i>
              </div>
              <p class="text-blue-100 text-xs font-medium">Products</p>
            </div>
            <div class="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center">
              <div class="w-6 h-6 sm:w-8 sm:h-8 bg-slate-400 rounded-full mx-auto mb-1 sm:mb-2 flex items-center justify-center">
                <i class="pi pi-chart-bar text-white text-xs sm:text-sm"></i>
              </div>
              <p class="text-blue-100 text-xs font-medium">Analytics</p>
            </div>
            <div class="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center">
              <div class="w-6 h-6 sm:w-8 sm:h-8 bg-blue-300 rounded-full mx-auto mb-1 sm:mb-2 flex items-center justify-center">
                <i class="pi pi-users text-white text-xs sm:text-sm"></i>
              </div>
              <p class="text-blue-100 text-xs font-medium">Subscriptions</p>
            </div>
            <div class="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center">
              <div class="w-6 h-6 sm:w-8 sm:h-8 bg-slate-300 rounded-full mx-auto mb-1 sm:mb-2 flex items-center justify-center">
                <i class="pi pi-money-bill text-white text-xs sm:text-sm"></i>
              </div>
              <p class="text-blue-100 text-xs font-medium">Revenue</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side: Auth Form -->
      <div
        class="w-full lg:w-1/2 flex flex-col justify-center px-2 sm:px-4 lg:px-8 xl:px-12 py-4 sm:py-6 lg:py-8 bg-white dark:bg-gray-800 shadow-lg rounded-tl-3xl rounded-bl-3xl overflow-y-auto"
      >
        <router-outlet />
      </div>
    </div>
    <p-toast position="top-right" class="mt-4" />
  `,
  styles: [``]
})
export class PartnerAuthComponent {}

