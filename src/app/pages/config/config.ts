import { ToastrService } from 'ngx-toastr';
import { Component, inject, OnInit } from '@angular/core';
import { Base } from '../../core/bases/base/base';
import { CategoryService } from '../../core/services/category.service';
import { CategoryItemService } from '../../core/services/category.-item.service';
import { PaymentMethodService } from '../../core/services/payment-method.service';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CategoryItemResponse } from '../../core/models/config/category-item/category-item-response.model';
import { CategoryResponse } from '../../core/models/config/category/category-response.model';
import { PaymentMethodResponse } from '../../core/models/config/payment-method/payment-method.models';
import { SelectionModel } from '@angular/cdk/collections';
import { ConfigCategoryModal } from './config-category-modal/config-category-modal';
import { MatDialog } from '@angular/material/dialog';
import { CreateCategoryRequest } from '../../core/models/config/category/create-category-request.model';
import { UpdateCategoryRequest } from '../../core/models/config/category/update-category-request.model';
import { DeactivateCategoryRequest } from '../../core/models/config/category/deactivate-category-request.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './config.html',
  styleUrls: ['./config.scss', '../../../styles/main.scss'],
})
export class Config extends Base implements OnInit {
  activeTab: 'categories' | 'subcategories' | 'payments' = 'categories';

  categoryColumns = ['select', 'description', 'type', 'actions'];
  subcategoryColumns = ['select', 'description', 'category', 'actions'];
  paymentColumns = ['select', 'description', 'actions'];

  categories: CategoryResponse[] = [];
  categoriesFilterDataSource = new MatTableDataSource<CategoryResponse>([]);
  selectionCategories = new SelectionModel<CategoryResponse>(true, []);

  subcategories: CategoryItemResponse[] = [];
  subCategoriesFilterDataSource = new MatTableDataSource<CategoryItemResponse>([]);
  selectionSubCCategories = new SelectionModel<CategoryItemResponse>(true, []);

  paymentMethods: PaymentMethodResponse[] = [];

  private categoryService = inject(CategoryService);
  private categoryItemService = inject(CategoryItemService);
  private paymentMethodService = inject(PaymentMethodService);
  private dialog = inject(MatDialog);
  private toastr = inject(ToastrService);

  searchTerm = '';
  typeFilter: 'I' | 'E' | 'V' | null = null;
  subcategoryFilter = '';
  allSubcategories: any[] = [];

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.getDatas();
  }

  getDatas() {
    this.getCategories();
    this.getSubCategories();
    this.getPaymentMethod();
  }

  getCategories() {
    this.categoryService.getAll().subscribe((res) => {
      if (res.isSuccess && res.value) {
        this.categories = res.value!;
        this.categoriesFilterDataSource.data = [...this.categories];
      }
    });
  }

  getSubCategories() {
    this.categoryItemService.getAll().subscribe((res) => {
      if (res.isSuccess && res.value) {
        this.subcategories = res.value!;
        console.log(this.subcategories);
      }
    });
  }

  getPaymentMethod() {
    this.paymentMethodService.getAll().subscribe((res) => {
      if (res.isSuccess && res.value) {
        this.paymentMethods = res.value!;
        console.log(this.paymentMethods);
      }
    });
  }

  setTab(tab: any) {
    this.activeTab = tab;
  }

  getTypeLabel(type: string, t: any) {
    if (type === 'I') return t['Income'];
    if (type === 'E') return t['Expense'];
    return t['Investment'];
  }

  OpenModalCategory(category?: CategoryResponse) {
    const dialogRef = this.dialog.open(ConfigCategoryModal, {
      data: { category },
    });

    dialogRef.afterClosed().subscribe(
      (result) => {
        if (result) {
          if (category) {
            const request: UpdateCategoryRequest = {
              id: result.id,
              description: result.description,
              codTypeTransaction: result.codTypeTransaction,
            };

            this.categoryService.update(request).subscribe(
              (res) => {
                if (res.isSuccess) {
                  this.toastr.success(res.message);
                  this.getCategories();
                  this.typeFilter = null;
                }
                this.toastr.warning(res.message);
              },
              (error) => {
                console.error(error);
              },
            );
          } else {
            const request: CreateCategoryRequest = {
              description: result.description,
              codTypeTransaction: result.codTypeTransaction,
            };

            this.categoryService.create(request).subscribe(
              (res) => {
                if (res.isSuccess) {
                  this.toastr.success(res.message);
                  this.getCategories();
                  this.typeFilter = null;
                }
                this.toastr.warning(res.message);
              },
              (error) => {
                console.error(error);
              },
            );
          }
        }
      },
      (error) => {
        console.error(error);
      },
    );
  }

  deleteCategory(event: any) {
    this.confirmModal('DeleteCategory', 'AreYouSureRemoveData', 'Yes', 'No', '380').subscribe(
      (result) => {
        if (!result) return;

        const request: DeactivateCategoryRequest = {
          id: event.id,
        };

        this.categoryService.deactivate(request).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.toastr.success(res.message);
              this.getCategories();
              this.typeFilter = null;
            } else {
              this.toastr.warning(res.message);
            }
          },
          error: (err) => {
            this.toastr.error(err.error);
          },
        });
      },
    );
  }

  addSubcategory() {}
  editSubcategory() {}
  deleteSubcategory() {}

  addPaymentMethod() {}
  editPaymentMethod() {}
  deletePaymentMethod() {}

  edit() {}
  remove() {}

  confirmModal(title: string, message: string, confirm: string, cancel: string, width?: string) {
    return this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title,
          message,
          confirmText: confirm,
          cancelText: cancel,
          width,
        },
      })
      .afterClosed();
  }

  toggleAll(event: any) {}

  setType(type: 'I' | 'E' | 'V' | null) {
    this.typeFilter = type;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.categories];

    if (this.typeFilter) {
      filtered = filtered.filter((c) => c.codTypeTransaction === this.typeFilter);
    }

    this.categoriesFilterDataSource.data = filtered;
  }

  onSearchCategories(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchText = input.value.trim().toLowerCase();

    let filtered = [...this.categories];

    if (this.typeFilter) {
      filtered = filtered.filter((c) => c.codTypeTransaction === this.typeFilter);
    }

    if (searchText) {
      filtered = filtered.filter((c) => c.description.toLowerCase().includes(searchText));
    }

    this.categoriesFilterDataSource.data = filtered;
  }

  toggleRow(row: CategoryResponse, table: string) {
    if (table === 'category') this.selectionCategories.toggle(row);
  }

  isAllSelected(table: string): boolean {
    if (table === 'category') {
      const numSelected = this.selectionCategories.selected.length;
      const numRows = this.categoriesFilterDataSource.data.length;
      return numSelected === numRows && numRows > 0;
    }

    return false;
  }

  isSomeSelected(table: string): boolean {
    if (table === 'category') {
      const numSelected = this.selectionCategories.selected.length;
      const numRows = this.categoriesFilterDataSource.data.length;
      return numSelected > 0 && numSelected < numRows;
    }
    return false;
  }

  masterToggle(event: any, table: string) {
    if (table === 'category') {
      if (event.checked) {
        this.selectionCategories.select(...this.categoriesFilterDataSource.data);
      } else {
        this.selectionCategories.clear();
      }
    }
  }
}
