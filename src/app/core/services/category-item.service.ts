import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoryItemResponse } from '../models/config/category-item/category-item-response.model';
import { ResultEntity } from '../models/result-entity.model';
import { CreateCategoryItemRequest } from '../models/config/category-item/create-category-item-request.model';
import { UpdateCategoryItemRequest } from '../models/config/category-item/update-category-item-request.model';
import { DeactivateCategoryItemSelectRequest } from '../models/config/category-item/deactive-category-item-select-request.model';
import { DeactivateCategoryItemRequest } from '../models/config/category-item/deactive-category-item-request.model';
import { BaseService } from '../bases/base/base-service';

@Injectable({
  providedIn: 'root',
})
export class CategoryItemService extends BaseService {
  private apiUrl = this.url + '/categoryitems';

  getAll(id: number): Observable<ResultEntity<CategoryItemResponse[]>> {
    const params = new HttpParams().set('categoryId', id);
    return this.http.get<ResultEntity<CategoryItemResponse[]>>(`${this.apiUrl}/GetAll/`, {
      params,
    });
  }

  getAllByUser(): Observable<ResultEntity<CategoryItemResponse[]>> {
    return this.http.get<ResultEntity<CategoryItemResponse[]>>(`${this.apiUrl}/GetAllByUser/`);
  }

  getById(id: number): Observable<ResultEntity<CategoryItemResponse>> {
    return this.http.get<ResultEntity<CategoryItemResponse>>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateCategoryItemRequest): Observable<ResultEntity<CategoryItemResponse>> {
    return this.http.post<ResultEntity<CategoryItemResponse>>(this.apiUrl, request);
  }

  update(request: UpdateCategoryItemRequest): Observable<ResultEntity<CategoryItemResponse>> {
    return this.http.put<ResultEntity<CategoryItemResponse>>(this.apiUrl, request);
  }

  deactivate(request: DeactivateCategoryItemRequest): Observable<ResultEntity<void>> {
    return this.http.delete<ResultEntity<void>>(this.apiUrl, {
      body: request,
    });
  }

  deactivateRange(request: DeactivateCategoryItemSelectRequest): Observable<ResultEntity<void>> {
    return this.http.delete<ResultEntity<void>>(this.apiUrl + '/DeactivateRange', {
      body: request,
    });
  }
}
