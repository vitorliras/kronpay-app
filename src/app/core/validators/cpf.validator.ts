import { AbstractControl, ValidationErrors } from '@angular/forms';

export function cpfValidator(control: AbstractControl): ValidationErrors | null {
  const cpf = (control.value || '').replace(/\D/g, '');

  if (!cpf || cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
    return { cpfInvalid: true };
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += +cpf[i] * (10 - i);
  }

  let digit1 = (sum * 10) % 11;
  digit1 = digit1 === 10 ? 0 : digit1;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += +cpf[i] * (11 - i);
  }

  let digit2 = (sum * 10) % 11;
  digit2 = digit2 === 10 ? 0 : digit2;

  return digit1 === +cpf[9] && digit2 === +cpf[10]
    ? null
    : { cpfInvalid: true };
}
