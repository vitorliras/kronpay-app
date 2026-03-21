import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function moneyValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (value === null || value === undefined || value === '') {
      return null;
    }

    const valueAsString = String(value);

    if (!/^\d+(,\d{1,2})?$/.test(valueAsString)) {
      return { invalidMoney: true };
    }

    return null;
  };
}
