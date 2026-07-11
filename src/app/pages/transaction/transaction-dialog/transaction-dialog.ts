import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
  NativeDateAdapter,
} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { PaymentMethodResponse } from '../../../core/models/config/payment-method/payment-method.models';
import { Base } from '../../../core/bases/base/base';
import { CategoryResponse } from '../../../core/models/config/category/category-response.model';
import { CategoryItemResponse } from '../../../core/models/config/category-item/category-item-response.model';
import { Transaction } from '../../../core/models/transaction/transaction.model';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { OnlyNumbersDirective } from '../../../shared/directives/only-numbers.directive';
import { MoneyInputDirective } from '../../../shared/directives/money-input.directive';
import { MatTooltip } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';

export const BR_DATE_FORMATS = {
  parse: { dateInput: 'DD/MM/YYYY' },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-transaction-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    MatDatepickerModule,
    OnlyNumbersDirective,
    MatNativeDateModule,
    MatDialogModule,
    MoneyInputDirective,
    MatTooltip,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    { provide: MAT_DATE_FORMATS, useValue: BR_DATE_FORMATS },
    { provide: DateAdapter, useClass: NativeDateAdapter },
  ],
  templateUrl: './transaction-dialog.html',
  styleUrls: ['./transaction-dialog.scss', '../../../../styles/modal-register.scss'],
})
export class TransactionDialogComponente extends Base {
  private toastr = inject(ToastrService);

  filteredSubCategories: CategoryItemResponse[] = [];
  filteredCategories: CategoryResponse[] = [];
  form: FormGroup;
  title = 'Add';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TransactionDialogComponente>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      transaction: Transaction;
      categories: CategoryResponse[];
      subCategories: CategoryItemResponse[];
      paymentMethods: PaymentMethodResponse[];
      width?: string;
      message: string
    },
  ) {
    super();

    if(data.message){
      this.toastr.success(data.message);
    }

    this.form = this.fb.group({
      id: [null],
      amount: [null, Validators.required],
      description: ['', Validators.required],
      transactionDate: [new Date(), Validators.required],
      typeTransaction: ['', Validators.required],
      recurrenceType: [''],
      installments: [null],
      categoryId: [null],
      subCategoryId: [null],
      paymentMethodId: [null],
      endDate: [null],
      updateGroup: [false],
    });

    this.valueChanges();

    const transaction = data.transaction;

    if (transaction) {
      let recurrenceType = '';

      if (transaction.installments) {
        if (transaction.typeGroup) recurrenceType = transaction.typeGroup;
      }

      this.title = 'Edit';
      this.form.patchValue({
        id: transaction.id,
        amount: transaction.amount,
        description: transaction.description,
        transactionDate: new Date(transaction.transactionDate),
        typeTransaction: transaction.codTypeTransaction,
        recurrenceType: recurrenceType,
        installments: transaction.installments,
        categoryId: transaction.categoryId,
        subCategoryId: transaction.categoryItemId,
        paymentMethodId: transaction.idPaymentMethod,
      });

      this.form.controls['installments'].disable();
      this.form.controls['recurrenceType'].disable();

      this.form.updateValueAndValidity({ emitEvent: true });

    }

  }

  valueChanges() {
    this.form.get('typeTransaction')?.valueChanges.subscribe((type) => {
      if (!type) {
        this.filteredCategories = [];
        this.form.get('categoryId')?.disable();
        this.form.get('categoryId')?.reset();
      } else {
        this.filteredCategories = this.data.categories.filter((c) => c.codTypeTransaction === type);
        this.form.get('categoryId')?.enable();

        this.form.get('categoryId')?.reset();
      }
    });

    this.form.get('categoryId')?.valueChanges.subscribe((categoryId) => {
      if (!categoryId) {
        this.filteredSubCategories = [];
        this.form.get('subCategoryId')?.disable();
        this.form.get('subCategoryId')?.reset();
      } else {
        this.filteredSubCategories = this.data.subCategories.filter(
          (s) => s.categoryId === categoryId,
        );
        this.form.get('subCategoryId')?.enable();

        this.form.get('subCategoryId')?.reset();
      }
    });

    this.form.get('installments')?.valueChanges.subscribe((value) => {
      if (value > 1) {
        this.form.patchValue({
          recurrenceType: 'F',
        });
        this.setEndDate();
      }
    });

    this.form.get('transactionDate')?.valueChanges.subscribe(() => {
      this.setEndDate();
    });
  }

  setEndDate() {
    const transactionDate: Date | null = this.form.get('transactionDate')?.value;
    const installments: number | null = this.form.get('installments')?.value;

    if (!transactionDate || !installments || installments <= 1) {
      this.form.get('endDate')?.setValue(null);
      return;
    }

    const start = new Date(transactionDate);

    const endMonth = start.getMonth() + Number(installments) - 1;
    const end = new Date(start.getTime());

    end.setMonth(endMonth);

    this.form.get('endDate')?.setValue(end);
  }

  onDateInput(event: any) {
    let value = event.target.value.replace(/\D/g, '');

    if (value.length > 2) value = value.replace(/^(\d{2})(\d)/, '$1/$2');
    if (value.length > 5) value = value.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');

    event.target.value = value;

    if (value.length === 10) {
      const [day, month, year] = value.split('/').map(Number);

      const date = new Date(year, month - 1, day);

      if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
        this.form.get('transactionDate')?.setValue(date);
        this.setEndDate();
      }
    }
  }

  save() {
    if (this.form.valid && this.form.get('description')?.value.trim()) {
      const value = this.form.value;

      if (typeof value.transactionDate === 'string') {
        const [day, month, year] = value.transactionDate.split('/');
        value.transactionDate = new Date(+year, +month - 1, +day);
      }

      const formValue = { ...this.form.value };

      if (formValue.amount && formValue.amount.toString().includes(',')) {
        formValue.amount = Number(formValue.amount.toString().replace(',', '.'));
      } else {
        formValue.amount = Number(formValue.amount.toString());
      }

      if (this.form.get('installments')?.value == 0 || this.form.get('installments')?.value == null)
        this.form.get('installments')?.setValue(1);

      if (this.form.get('recurrenceType')?.value === 'F' && this.title === 'Edit') {
        this.confirmModal('Atention', 'ChangeOtherInstallments', 'Yes', 'No', '400').subscribe(
          (res) => {
            if (res) {
              this.form.get('updateGroup')?.setValue(true);

              this.dialogRef.close(formValue);
            }
          },
        );
      } else {
        this.dialogRef.close(formValue);
      }
    }
    if(!this.form.get('description')?.value.trim())
        this.form.get('description')?.setValue('');

    this.form.markAllAsTouched();
  }

  close() {
    this.dialogRef.close();
  }

  onRecurrenceChange(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;

    this.form.patchValue({
      recurrenceType: checked ? 'I' : 'F',
    });
  }
}
