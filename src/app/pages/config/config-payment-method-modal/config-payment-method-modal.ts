import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { Base } from '../../../core/bases/base/base';
import { PaymentMethodResponse } from '../../../core/models/config/payment-method/payment-method.models';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-config-payment-method-modal',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule
  ],
  templateUrl: './config-payment-method-modal.html',
  styleUrls: ['./config-payment-method-modal.scss', '../../../../styles/modal-register.scss'],
})
export class ConfigPaymentMethodModal extends Base {
  form: FormGroup;
  title = 'Add';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ConfigPaymentMethodModal>,
    @Inject(MAT_DIALOG_DATA) public data: { paymentMethod: PaymentMethodResponse ,width?: string },
  ) {
    super();
    var paymentMethod = data.paymentMethod;

    this.form = this.fb.group({
      id: [null],
      isActive: [true],
      description: ['', Validators.required],
    });

    if (paymentMethod) {
      this.title = 'Edit';
      this.form.patchValue({
        id: paymentMethod.id,
        isActive: paymentMethod.isActive,
        description: paymentMethod.description,
      });
    }
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  close() {
    this.dialogRef.close();
  }

}
