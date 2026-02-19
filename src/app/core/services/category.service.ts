import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResultEntity } from '../models/result-entity.model';
import { CategoryResponse } from '../models/config/category/category-response.model';
import { CreateCategoryRequest } from '../models/config/category/create-category-request.model';
import { UpdateCategoryRequest } from '../models/config/category/update-category-request.model';
import { DeactivateCategoryRequest } from '../models/config/category/deactivate-category-request.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAll(): Observable<ResultEntity<CategoryResponse[]>> {
    return this.http.get<ResultEntity<CategoryResponse[]>>(`${this.apiUrl}/categories`);
  }

  getById(id: number): Observable<ResultEntity<CategoryResponse>> {
    return this.http.get<ResultEntity<CategoryResponse>>(`${this.apiUrl}/categories/${id}`);
  }

  create(request: CreateCategoryRequest): Observable<ResultEntity<CategoryResponse>> {
    return this.http.post<ResultEntity<CategoryResponse>>(`${this.apiUrl}/categories`, request);
  }

  update(request: UpdateCategoryRequest): Observable<ResultEntity<CategoryResponse>> {
    return this.http.put<ResultEntity<CategoryResponse>>(`${this.apiUrl}/categories`, request);
  }

  deactivate(request: DeactivateCategoryRequest): Observable<ResultEntity<void>> {
    return this.http.request<ResultEntity<void>>('DELETE', `${this.apiUrl}/categories`, {
      body: request,
    });
  }
}
