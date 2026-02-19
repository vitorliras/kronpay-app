import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value || '';

  if (!value.trim()) return { required: true };
  if (value.length < 8) return { length: true };
  if (!/[A-Z]/.test(value)) return { uppercase: true };
  if (!/[a-z]/.test(value)) return { lowercase: true };
  if (!/[\W_]/.test(value)) return { special: true };
  if (/012|123|234|345|456|567|678|789/.test(value)) {
    return { sequential: true };
  }

  return null;
}
