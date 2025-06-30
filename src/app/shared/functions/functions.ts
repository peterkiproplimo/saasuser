import {Location} from '@angular/common'

import {inject} from "@angular/core";
import {AbstractControl, ValidationErrors, ValidatorFn} from "@angular/forms";
import {HttpParams} from '@angular/common/http';
import {MessageService} from 'primeng/api';
import { FormGroup } from '@angular/forms';


export class Functions {
  location = inject(Location)

  back() {
    this.location.back();
  }

  message_service = inject(MessageService);

  show_toast(title: string, severity: string, message:string) {
    this.message_service.add({ severity: severity, summary: title, detail: message });
  }

  hasPatternError(form: any, key: any): boolean {
    return (
      form.get(key).errors?.['pattern'] &&
      (form.get(key).dirty ||
        form.get(key).touched)
    );
  }

  hasFieldError(form: any, key: any): boolean {
    return (
      form?.get(key)?.invalid &&
      (form?.get(key).dirty ||
        form?.get(key).touched)
    );
  }

  allSpacesError(form: any, key: any): boolean {
    return (
      form.get(key).errors?.['allSpaces'] &&
      (form.get(key).dirty ||
        form.get(key).touched)
    );
  }

  notIntegerError(form: any, key: any): boolean {
    return (
      form.get(key).errors?.['notInteger'] &&
      (form.get(key).dirty ||
        form.get(key).touched)
    );
  }

  hasFieldRequiredError(form: any, key: any): boolean {
    return (
      form.get(key).errors?.['required'] &&
      (form.get(key).dirty ||
        form.get(key).touched)
    );
  }

  isFieldRequired(form: any, key: any): boolean {
    return (
      form.get(key).isFieldRequired
    )
  }

  hasMinError(form: any, key: any): boolean {
    return (
      form.get(key).errors?.['min'] &&
      (form.get(key).dirty ||
        form.get(key).touched)
    );
  }

  hasMaxLengthError(form: any, key: any): boolean {
    return (
      form.get(key).errors?.['maxlength'] &&
      (form.get(key).dirty ||
        form.get(key).touched)
    );
  }

  hasEmailError(form: any, key: any): boolean {
    return (
      form.get(key).errors?.['email'] &&
      (form.get(key).dirty ||
        form.get(key).touched)
    );
  }

  hasMinDateError(form: any, key: any): boolean {
    return (
      form.get(key).errors?.['minDate'] &&
      (form.get(key).dirty ||
        form.get(key).touched)
    );
  }
}

export function IntegerValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined || value === '') {
      return null; // Allow empty values (if not required)
    }
    const isInteger = Number.isInteger(+value);
    return isInteger ? null : {notInteger: true};
  };
}

// Custom validator for min date
export function minDateValidator(minDate: Date) {
  return (control: any) => {
    const selectedDate = new Date(control.value);
    return selectedDate < minDate ? { minDate: true } : null;
  };
}

export function SpacesValidator(): ValidatorFn {
  const regex = /^(?!\s*$)[^\n]*$/m;

  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!regex.test(value)) {
      return {allSpaces: true};
    }
    return null;
  };
}

export function  prepare_params(page: number, page_size: number, search_term: string): HttpParams {
  const cleanedSearchTerm = (search_term ?? '').trim();

  let params = new HttpParams()
    .set('page', page.toString())
    .set('page_size', page_size.toString());

  if (cleanedSearchTerm) {
    params = params.set('search', cleanedSearchTerm);
  }

  return params;
}

export function passwordMatchValidator(): ValidatorFn {
  return (form: AbstractControl): ValidationErrors | null => {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirm_password')?.value;

    return password === confirmPassword ? null : { passwordMismatch: true };
  };
}
