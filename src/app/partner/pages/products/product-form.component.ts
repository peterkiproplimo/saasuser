import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { FileUploadModule } from 'primeng/fileupload';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PartnerProductService } from '../../services/partner-product.service';
import { PartnerProduct, SubscriptionPlan } from '../../models/partner.model';
import { Functions } from '../../../shared/functions/functions';

@Component({
  selector: 'app-product-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ProgressSpinner,
    ButtonModule,
    CardModule,
    DividerModule,
    TagModule,
    ChipModule,
    FileUploadModule,
    TooltipModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(PartnerProductService);
  router = inject(Router);
  private route = inject(ActivatedRoute);
  private functions = new Functions();

  productForm!: FormGroup;
  loading = false;
  isEditMode = false;
  productId: string | null = null;
  logoPreview: string | null = null;
  logoFile: File | null = null;
  formInitialized = false;
  
  currencyOptions = [
    { label: 'KES - Kenyan Shilling', value: 'KES' },
    { label: 'USD - US Dollar', value: 'USD' },
    { label: 'EUR - Euro', value: 'EUR' }
  ];

  ngOnInit() {
    try {
      console.log('ProductFormComponent ngOnInit called');
      this.productId = this.route.snapshot.paramMap.get('id');
      this.isEditMode = !!this.productId;
      console.log('Product ID:', this.productId, 'Edit Mode:', this.isEditMode);

      this.initForm();
      console.log('Form initialized:', this.formInitialized);

      if (this.isEditMode && this.productId) {
        this.loadProduct(this.productId);
      }
    } catch (error) {
      console.error('Error initializing product form:', error);
      this.functions.show_toast('Error', 'error', 'Failed to initialize form.');
      // Initialize form anyway to prevent blank screen
      if (!this.formInitialized) {
        this.initForm();
      }
    }
  }

  initForm() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      category: [''],
      logo: [null],
      subscription_plans: this.fb.array([
        this.createPlanFormGroup()
      ])
    });
    this.formInitialized = true;
  }

  createPlanFormGroup(planId?: string): FormGroup {
    return this.fb.group({
      id: [planId || ''],
      name: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]],
      currency: ['KES', [Validators.required]],
      features: ['']
    });
  }

  get plansArray(): FormArray {
    if (!this.productForm) {
      return this.fb.array([]);
    }
    return this.productForm.get('subscription_plans') as FormArray;
  }

  getPlanFeatures(planControl: any): string[] {
    const featuresValue = planControl?.get('features')?.value;
    if (!featuresValue || typeof featuresValue !== 'string') {
      return [];
    }
    return featuresValue.split(',').map((f: string) => f.trim()).filter((f: string) => f.length > 0);
  }

  addPlan() {
    this.plansArray.push(this.createPlanFormGroup());
  }

  removePlan(index: number) {
    if (this.plansArray.length > 1) {
      this.plansArray.removeAt(index);
    }
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.logoFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreview = e.target.result;
        this.productForm.patchValue({ logo: this.logoPreview });
      };
      reader.readAsDataURL(this.logoFile);
    }
  }

  loadProduct(id: string) {
    this.loading = true;
    console.log('Loading product with ID:', id);
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        console.log('Product loaded:', product);
        if (product) {
          // Patch form with product data
          this.productForm.patchValue({
            name: product.name || '',
            description: product.description || '',
            category: (product as any).category || '',
            logo: product.logo || null
          });
          this.logoPreview = product.logo || null;

          // Clear existing plans and add loaded plans
          while (this.plansArray.length !== 0) {
            this.plansArray.removeAt(0);
          }
          
          // Add plans if they exist
          if (product.subscription_plans && product.subscription_plans.length > 0) {
            product.subscription_plans.forEach(plan => {
              this.plansArray.push(this.fb.group({
                id: [plan.id || ''],
                name: [plan.name || '', [Validators.required]],
                price: [plan.price || 0, [Validators.required, Validators.min(0)]],
                currency: [plan.currency || 'KES', [Validators.required]],
                features: [plan.features ? (Array.isArray(plan.features) ? plan.features.join(', ') : plan.features) : '']
              }));
            });
          } else {
            // If no plans, add one empty plan
            this.plansArray.push(this.createPlanFormGroup());
          }
          
          console.log('Form patched with product data');
        } else {
          console.error('Product is null or undefined');
          this.functions.show_toast('Error', 'error', 'Product not found.');
          this.router.navigate(['/partner/products']);
        }
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        console.error('Load product error:', error);
        console.error('Error details:', {
          status: error.status,
          message: error.message,
          error: error.error
        });
        this.functions.show_toast('Error', 'error', error?.error?.message || 'Failed to load product.');
        this.router.navigate(['/partner/products']);
      }
    });
  }

  onSubmit() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.functions.show_toast('Validation Error', 'error', 'Please fill all required fields.');
      return;
    }

    this.loading = true;

    try {
      const formValue = this.productForm.value;
      const subscriptionPlans: SubscriptionPlan[] = formValue.subscription_plans.map((plan: any, index: number) => ({
        id: this.isEditMode ? plan.id || `plan_${Date.now()}_${index}` : `plan_${Date.now()}_${index}`,
        name: plan.name,
        price: parseFloat(plan.price),
        currency: plan.currency,
        features: plan.features ? (typeof plan.features === 'string' 
          ? plan.features.split(',').map((f: string) => f.trim()).filter((f: string) => f)
          : plan.features) : []
      }));

      // Use logoPreview if formValue.logo is empty (in case it wasn't patched correctly)
      const logoToSend = formValue.logo || this.logoPreview || undefined;
      
      const productData = {
        name: formValue.name,
        description: formValue.description,
        category: formValue.category || undefined,
        logo: logoToSend,
        subscription_plans: subscriptionPlans
      };

      console.log('Submitting product data:', {
        ...productData,
        logo: logoToSend ? `${logoToSend.substring(0, 50)}... (${logoToSend.length} chars)` : 'null'
      });

      if (this.isEditMode && this.productId) {
        this.productService.updateProduct(this.productId, productData).subscribe({
          next: (updatedProduct) => {
            console.log('Product updated, response:', updatedProduct);
            this.loading = false;
            this.functions.show_toast('Success', 'success', 'Product updated successfully.');
            this.router.navigate(['/partner/products']);
          },
          error: (error) => {
            this.loading = false;
            console.error('Update error:', error);
            this.functions.show_toast('Error', 'error', error?.message || 'Failed to update product.');
          }
        });
      } else {
        this.productService.createProduct(productData).subscribe({
          next: () => {
            this.loading = false;
            this.functions.show_toast('Success', 'success', 'Product created successfully.');
            this.router.navigate(['/partner/products']);
          },
          error: (error) => {
            this.loading = false;
            console.error('Create error:', error);
            this.functions.show_toast('Error', 'error', error?.message || 'Failed to create product.');
          }
        });
      }
    } catch (error) {
      this.loading = false;
      console.error('Form submission error:', error);
      this.functions.show_toast('Error', 'error', 'An error occurred while processing the form.');
    }
  }
}

