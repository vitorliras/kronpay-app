import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[moneyInput]',
  standalone: true,
})
export class MoneyInputDirective {

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    value = value.replace(/[^0-9.,]/g, '');

    const hasComma = value.includes(',');
    const hasDot = value.includes('.');

    if (hasComma && hasDot) {
      const lastChar = value[value.length - 1];

      if (lastChar === '.') {
        value = value.replace('.', '');
      } else {
        value = value.replace(',', '');
      }
    }

    const separator = value.includes(',') ? ',' : value.includes('.') ? '.' : null;

    if (separator) {
      const parts = value.split(separator);

      if (parts.length > 2) {
        value = parts[0] + separator + parts[1];
      }

      if (parts[1]?.length > 2) {
        value = parts[0] + separator + parts[1].substring(0, 2);
      }

      if (value.startsWith(separator)) {
        value = '';
      }
    }

    if (input.value !== value) {
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
  }

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;

    if (!/[\d,.]/.test(event.key)) {
      event.preventDefault();
      return;
    }

    if ((event.key === ',' && input.value.includes('.')) ||
        (event.key === '.' && input.value.includes(','))) {
      event.preventDefault();
      return;
    }

    if ((event.key === ',' && input.value.includes(',')) ||
        (event.key === '.' && input.value.includes('.'))) {
      event.preventDefault();
    }
  }
}
