import { ToastrService } from 'ngx-toastr';
import { Component, inject, OnInit, viewChild } from '@angular/core';
import { Base } from '../../core/bases/base/base';
import { CategoryService } from '../../core/services/category.service';
import { CategoryItemService } from '../../core/services/category.-item.service';
import { PaymentMethodService } from '../../core/services/payment-method.service';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CategoryItemResponse } from '../../core/models/config/category-item/category-item-response.model';
import { CategoryResponse } from '../../core/models/config/category/category-response.model';
import {
  CreatePaymentMethodRequest,
  DeactivatePaymentMethodSelectRequest,
  PaymentMethodIdRequest,
  PaymentMethodResponse,
  UpdatePaymentMethodRequest,
} from '../../core/models/config/payment-method/payment-method.models';
import { SelectionModel } from '@angular/cdk/collections';
import { ConfigCategoryModal } from './config-category-modal/config-category-modal';
import { MatDialog } from '@angular/material/dialog';
import { CreateCategoryRequest } from '../../core/models/config/category/create-category-request.model';
import { UpdateCategoryRequest } from '../../core/models/config/category/update-category-request.model';
import { DeactivateCategoryRequest } from '../../core/models/config/category/deactivate-category-request.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog';
import { ConfigCategoryItemModal } from './config-category-item-modal/config-category-item-modal';
import { UpdateCategoryItemRequest } from '../../core/models/config/category-item/update-category-item-request.model';
import { CreateCategoryItemRequest } from '../../core/models/config/category-item/create-category-item-request.model';
import { Paginator } from '../../shared/ui/paginator';
import { ConfigPaymentMethodModal } from './config-payment-method-modal/config-payment-method-modal';
import { DeactivateCategoryItemSelectRequest } from '../../core/models/config/category-item/deactive-category-item-select-request.model';
import { DeactivateCategoryItemRequest } from '../../core/models/config/category-item/deactive-category-item-request.model';
import { DeactivateCategorySelectRequest } from '../../core/models/config/category/deactive-category-select-request.model';

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
  providers: [
    {
      provide: MatPaginatorIntl,
      useFactory: Paginator,
    },
  ],
  templateUrl: './config.html',
  styleUrls: ['./config.scss', '../../../styles/main.scss'],
})
export class Config extends Base implements OnInit {
  readonly paginatorSubCategories = viewChild.required<MatPaginator>('paginatorSubCategories');
  readonly paginatorCategories = viewChild.required<MatPaginator>('paginatorCategories');
  readonly paginatorPaymentMethod = viewChild.required<MatPaginator>('paginatorPaymentMethod');

  activeTab: 'categories' | 'subcategories' | 'payments' = 'categories';

  categoryColumns = ['select', 'description', 'type', 'actions'];
  subcategoryColumns = ['select', 'description', 'category', 'actions'];
  paymentColumns = ['select', 'description', 'actions'];

  categories: CategoryResponse[] = [];
  categoriesFilter: CategoryResponse[] = [];
  categoriesFilterDataSource = new MatTableDataSource<CategoryResponse>([]);
  selectionCategories = new SelectionModel<CategoryResponse>(true, []);

  subcategories: CategoryItemResponse[] = [];
  subCategoriesFilterDataSource = new MatTableDataSource<CategoryItemResponse>([]);
  selectionSubCategories = new SelectionModel<CategoryItemResponse>(true, []);

  paymentMethods: PaymentMethodResponse[] = [];
  paymentMethodsFilterDataSource = new MatTableDataSource<PaymentMethodResponse>([]);
  selectionPaymentMethods = new SelectionModel<PaymentMethodResponse>(true, []);

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
    this.getPaymentMethod();
  }

  getCategories() {
    this.categoryService.getAll().subscribe((res) => {
      if (res.isSuccess && res.value) {
        this.categories = res.value!;
        this.categoriesFilter = [...this.categories];
        this.categoriesFilterDataSource.data = [...this.categories];
        this.categoriesFilterDataSource.paginator = this.paginatorCategories();
      }
    });
  }

  getPaymentMethod() {
    this.paymentMethodService.getAll().subscribe((res) => {
      if (res.isSuccess && res.value) {
        this.paymentMethods = res.value!;
        this.paymentMethodsFilterDataSource.data = [...this.paymentMethods];
        this.paymentMethodsFilterDataSource.paginator = this.paginatorPaymentMethod();
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
                } else this.toastr.warning(res.message);
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
                } else this.toastr.warning(res.message);

                this.OpenModalCategory();
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
    this.confirmModal('DeleteCategory', 'AreYouSureRemoveData', 'Yes', 'No', '380', 'help_outline').subscribe(
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

  deleteSelectCategories() {
    if (this.selectionCategories.isEmpty()) {
      this.messageWarning('SelectAtLeastOneItemToBeRemoved');
      return;
    }

    this.confirmModal('Delete', 'AreYouSureRemoveData', 'Yes', 'No', '380', 'help_outline').subscribe((result) => {
      if (!result) return;
      const selectedCategories = this.selectionCategories.selected;

      const listCategoriesId: DeactivateCategoryRequest[] = selectedCategories.map((item) => ({
        id: item.id,
      }));

      let itens: DeactivateCategorySelectRequest = {
        categories: listCategoriesId,
      };

      this.categoryService.deactivateRange(itens).subscribe({
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
    });
  }

  OpenModalCategoryItem(item?: CategoryResponse) {
    const dialogRef = this.dialog.open(ConfigCategoryItemModal, {
      data: {
        categories: this.categories,
        item: item,
        category: Number(this.subcategoryFilter) ?? 0,
        with: '400',
      },
    });

    dialogRef.afterClosed().subscribe(
      (result) => {
        if (result) {
          if (item) {
            const request: UpdateCategoryItemRequest = {
              id: result.id,
              description: result.description,
              categoryId: result.categoryId,
            };

            this.categoryItemService.update(request).subscribe(
              (res) => {
                if (res.isSuccess) {
                  this.toastr.success(res.message);
                  this.getSubCategoriesByIdCategory(this.subcategoryFilter);
                } else this.toastr.warning(res.message);
              },
              (error) => {
                console.error(error);
              },
            );
          } else {
            const request: CreateCategoryItemRequest = {
              description: result.description,
              categoryId: result.categoryId,
            };

            this.categoryItemService.create(request).subscribe(
              (res) => {
                if (res.isSuccess) {
                  this.toastr.success(res.message);
                  this.subcategoryFilter = request.categoryId.toString();
                  this.getSubCategoriesByIdCategory(this.subcategoryFilter);
                } else this.toastr.warning(res.message);

                this.OpenModalCategoryItem();
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

  deleteSubcategory(event: any) {
    this.confirmModal('DeleteCategory', 'AreYouSureRemoveData', 'Yes', 'No', '380', 'help_outline').subscribe(
      (result) => {
        if (!result) return;

        const request: DeactivateCategoryRequest = {
          id: event.id,
        };

        this.categoryItemService.deactivate(request).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.toastr.success(res.message);
              this.getSubCategoriesByIdCategory(this.subcategoryFilter);
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

  deleteSelectSubCategories() {
    if (this.selectionSubCategories.isEmpty()) {
      this.messageWarning('SelectAtLeastOneItemToBeRemoved');
      return;
    }

    this.confirmModal('Delete', 'AreYouSureRemoveData', 'Yes', 'No', '380', 'help_outline').subscribe((result) => {
      if (!result) return;
      const selectedSubCategories = this.selectionSubCategories.selected;

      const listSubCategoriesId: DeactivateCategoryItemRequest[] = selectedSubCategories.map(
        (item) => ({
          id: item.id,
        }),
      );

      let itens: DeactivateCategoryItemSelectRequest = {
        categoryItems: listSubCategoriesId,
      };

      this.categoryItemService.deactivateRange(itens).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastr.success(res.message);
            this.getSubCategoriesByIdCategory(this.subcategoryFilter);
            this.typeFilter = null;
          } else {
            this.toastr.warning(res.message);
          }
        },
        error: (err) => {
          this.toastr.error(err.error);
        },
      });
    });
  }

  OpenModalPaymentMethod(item?: PaymentMethodResponse) {
    const dialogRef = this.dialog.open(ConfigPaymentMethodModal, {
      data: {
        paymentMethod: item,
        with: '400',
      },
    });

    dialogRef.afterClosed().subscribe(
      (result) => {
        if (result) {
          if (item) {
            const request: UpdatePaymentMethodRequest = {
              id: result.id,
              description: result.description,
            };

            this.paymentMethodService.update(request).subscribe(
              (res) => {
                if (res.isSuccess) {
                  this.toastr.success(res.message);
                  this.getPaymentMethod();
                } else this.toastr.warning(res.message);
              },
              (error) => {
                console.error(error);
              },
            );
          } else {
            const request: CreatePaymentMethodRequest = {
              description: result.description,
            };

            this.paymentMethodService.create(request).subscribe(
              (res) => {
                if (res.isSuccess) {
                  this.toastr.success(res.message);
                  this.getPaymentMethod();
                } else this.toastr.warning(res.message);

                this.OpenModalPaymentMethod();
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

  deletePaymentMethod(event: any) {
    this.confirmModal('Delete', 'AreYouSureRemoveData', 'Yes', 'No', '380', 'help_outline').subscribe((result) => {
      if (!result) return;

      const request: PaymentMethodIdRequest = {
        id: event.id,
      };

      this.paymentMethodService.deactivate(request).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastr.success(res.message);
            this.getPaymentMethod();
          } else {
            this.toastr.warning(res.message);
          }
        },
        error: (err) => {
          this.toastr.error(err.error);
        },
      });
    });
  }

  deleteSelectPaymentMethods() {
    if (this.selectionPaymentMethods.isEmpty()) {
      this.messageWarning('SelectAtLeastOneItemToBeRemoved');
      return;
    }

    this.confirmModal('Delete', 'AreYouSureRemoveData', 'Yes', 'No', '380', 'help_outline').subscribe((result) => {
      if (!result) return;

      const selectedPaymentMethods = this.selectionPaymentMethods.selected;

      const listPaymentMethodsId: PaymentMethodIdRequest[] = selectedPaymentMethods.map((item) => ({
        id: item.id,
      }));

      let itens: DeactivatePaymentMethodSelectRequest = {
        paymentMethods: listPaymentMethodsId,
      };

      this.paymentMethodService.deactivateRange(itens).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastr.success(res.message);
            this.getPaymentMethod();
          } else {
            this.toastr.warning(res.message);
          }
        },
        error: (err) => {
          this.toastr.error(err.error);
        },
      });
    });
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
    this.categoriesFilterDataSource.paginator = this.paginatorCategories();
    this.categoriesFilter = [...filtered];
    this.subcategoryFilter = '';
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
    this.categoriesFilterDataSource.paginator = this.paginatorCategories();
  }

  onSearchSubCategories(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchText = input.value.trim().toLowerCase();

    let filtered = [...this.subcategories];

    if (searchText) {
      filtered = filtered.filter((c) => c.description.toLowerCase().includes(searchText));
    }

    this.subCategoriesFilterDataSource.data = filtered;
    this.subCategoriesFilterDataSource.paginator = this.paginatorSubCategories();
  }

  onSearchPaymentMethod(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchText = input.value.trim().toLowerCase();

    let filtered = [...this.paymentMethods];

    if (searchText) {
      filtered = filtered.filter((c) => c.description.toLowerCase().includes(searchText));
    }

    this.paymentMethodsFilterDataSource.data = filtered;
    this.paymentMethodsFilterDataSource.paginator = this.paginatorSubCategories();
  }

  getSubCategoriesByIdCategory(id: any) {
    if (!id) {
      this.subCategoriesFilterDataSource.data = [];

      return;
    }

    this.categoryItemService.getAll(Number(id)).subscribe((res) => {
      if (res.isSuccess && res.value) {
        this.subcategories = res.value;
        this.subCategoriesFilterDataSource.data = [...res.value];

        this.subCategoriesFilterDataSource.paginator = this.paginatorSubCategories();
      } else {
        this.toastr.warning(res.message);
        this.subCategoriesFilterDataSource.data = [];
      }
    });
  }

  toggleRow(row: any, table: string) {
    if (table === 'category') this.selectionCategories.toggle(row);
    if (table === 'subcategory') this.selectionSubCategories.toggle(row);
    if (table === 'paymentmethod') this.selectionPaymentMethods.toggle(row);
  }

  isAllSelected(table: string): boolean {
    if (table === 'category') {
      const numSelected = this.selectionCategories.selected.length;
      const numRows = this.categoriesFilterDataSource.data.length;
      return numSelected === numRows && numRows > 0;
    } else if (table === 'subcategory') {
      const numSelected = this.selectionSubCategories.selected.length;
      const numRows = this.subCategoriesFilterDataSource.data.length;
      return numSelected === numRows && numRows > 0;
    } else {
      const numSelected = this.selectionPaymentMethods.selected.length;
      const numRows = this.paymentMethodsFilterDataSource.data.length;
      return numSelected === numRows && numRows > 0;
    }
  }

  isSomeSelected(table: string): boolean {
    if (table === 'category') {
      const numSelected = this.selectionCategories.selected.length;
      const numRows = this.categoriesFilterDataSource.data.length;
      return numSelected > 0 && numSelected < numRows;
    } else if (table === 'subcategory') {
      const numSelected = this.selectionSubCategories.selected.length;
      const numRows = this.subCategoriesFilterDataSource.data.length;
      return numSelected > 0 && numSelected < numRows;
    } else {
      const numSelected = this.selectionPaymentMethods.selected.length;
      const numRows = this.paymentMethodsFilterDataSource.data.length;
      return numSelected > 0 && numSelected < numRows;
    }
  }

  masterToggle(event: any, table: string) {
    if (table === 'category') {
      if (event.checked) {
        this.selectionCategories.select(...this.categoriesFilterDataSource.data);
      } else {
        this.selectionCategories.clear();
      }
    }

    if (table === 'subcategory') {
      if (event.checked) {
        this.selectionSubCategories.select(...this.subCategoriesFilterDataSource.data);
      } else {
        this.selectionSubCategories.clear();
      }
    }

    if (table === 'paymentmethod') {
      if (event.checked) {
        this.selectionPaymentMethods.select(...this.paymentMethodsFilterDataSource.data);
      } else {
        this.selectionPaymentMethods.clear();
      }
    }
  }
}
