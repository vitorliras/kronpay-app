import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CategoryResponse } from '../../../core/models/config/category/category-response.model';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Base } from '../../../core/bases/base/base';
import { MatSelectModule } from '@angular/material/select';
import { CategoryItemResponse } from '../../../core/models/config/category-item/category-item-response.model';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-config-category-item-modal',
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
  templateUrl: './config-category-item-modal.html',
  styleUrls: ['./config-category-item-modal.scss', '../../../../styles/modal-register.scss'],
})
export class ConfigCategoryItemModal extends Base {
  form: FormGroup;
  title = 'Add';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ConfigCategoryItemModal>,
    @Inject(MAT_DIALOG_DATA) public data: { categories: CategoryResponse[], item :CategoryItemResponse, category: number,  width?: string },
  ) {
    super();
    const category = data.item;

    this.form = this.fb.group({
      id: [null],
      isActive: [true],
      description: ['', Validators.required],
      categoryId: [data.category ?? null, Validators.required],
    });

    if (category) {
      this.title = 'Edit';
      this.form.patchValue({
        id: category.id,
        isActive: category.isActive,
        description: category.description,
        categoryId: category.categoryId,
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
