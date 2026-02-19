import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategoryItemResponse } from '../models/config/category-item/category-item-response.model';
import { ResultEntity } from '../models/result-entity.model';
import { CreateCategoryItemRequest } from '../models/config/category-item/create-category-item-request.model';
import { UpdateCategoryItemRequest } from '../models/config/category-item/update-category-item-request.model';
import { DeactivateCategoryItemRequest } from '../models/config/category-item/deactive-category-item-request.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryItemService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private baseUrl = `${this.apiUrl}/categoryitems`;

  getAll(): Observable<ResultEntity<CategoryItemResponse[]>> {
    return this.http.get<ResultEntity<CategoryItemResponse[]>>(this.baseUrl);
  }

  getById(id: number): Observable<ResultEntity<CategoryItemResponse>> {
    return this.http.get<ResultEntity<CategoryItemResponse>>(`${this.baseUrl}/${id}`);
  }

  create(request: CreateCategoryItemRequest): Observable<ResultEntity<CategoryItemResponse>> {
    return this.http.post<ResultEntity<CategoryItemResponse>>(this.baseUrl, request);
  }

  update(request: UpdateCategoryItemRequest): Observable<ResultEntity<CategoryItemResponse>> {
    return this.http.put<ResultEntity<CategoryItemResponse>>(this.baseUrl, request);
  }

  deactivate(request: DeactivateCategoryItemRequest): Observable<ResultEntity<void>> {
    return this.http.delete<ResultEntity<void>>(this.baseUrl, {
      body: request,
    });
  }
}
