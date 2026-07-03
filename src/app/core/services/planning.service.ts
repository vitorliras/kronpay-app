import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../bases/base/base-service';
import { ResultEntity } from '../models/result-entity.model';
import { FinancialProjectionResponse } from '../models/planning/financial-projection-response.model';
import { SimulatePurchaseRequest } from '../models/planning/simulate-purchase-request.model';
import { PurchaseSimulationResponse } from '../models/planning/purchase-simulation-response.model';
import { MonthlyViabilityComparisonRequest } from '../models/planning/monthly-viability-comparison-request.model';
import { MonthlyViabilityComparisonResponse } from '../models/planning/monthly-viability-comparison-response.model';
import { CreatePlannedCommitmentRequest } from '../models/planning/create-planned-commitment-request.model';
import { UpdatePlannedCommitmentRequest } from '../models/planning/update-planned-commitment-request.model';
import { PlannedCommitmentResponse } from '../models/planning/planned-commitment-response.model';

@Injectable({ providedIn: 'root' })
export class PlanningService extends BaseService {
  private apiUrl = this.url + '/planning';

  getProjection(
    horizonMonths?: number | null,
    safetyReserve?: number | null,
  ): Observable<ResultEntity<FinancialProjectionResponse>> {
    let params = new HttpParams();
    if (horizonMonths != null) params = params.set('horizonMonths', horizonMonths);
    if (safetyReserve != null) params = params.set('safetyReserve', safetyReserve);

    return this.http.get<ResultEntity<FinancialProjectionResponse>>(`${this.apiUrl}/projection`, {
      params,
    });
  }

  simulatePurchase(
    request: SimulatePurchaseRequest,
  ): Observable<ResultEntity<PurchaseSimulationResponse>> {
    return this.http.post<ResultEntity<PurchaseSimulationResponse>>(
      `${this.apiUrl}/simulate-purchase`,
      request,
    );
  }

  getViabilityComparison(
    request: MonthlyViabilityComparisonRequest,
  ): Observable<ResultEntity<MonthlyViabilityComparisonResponse>> {
    return this.http.post<ResultEntity<MonthlyViabilityComparisonResponse>>(
      `${this.apiUrl}/viability-comparison`,
      request,
    );
  }

  getCommitments(): Observable<ResultEntity<PlannedCommitmentResponse[]>> {
    return this.http.get<ResultEntity<PlannedCommitmentResponse[]>>(`${this.apiUrl}/commitments`);
  }

  createCommitment(
    request: CreatePlannedCommitmentRequest,
  ): Observable<ResultEntity<PlannedCommitmentResponse>> {
    return this.http.post<ResultEntity<PlannedCommitmentResponse>>(
      `${this.apiUrl}/commitments`,
      request,
    );
  }

  updateCommitment(
    request: UpdatePlannedCommitmentRequest,
  ): Observable<ResultEntity<PlannedCommitmentResponse>> {
    return this.http.put<ResultEntity<PlannedCommitmentResponse>>(
      `${this.apiUrl}/commitments`,
      request,
    );
  }

  deactivateCommitment(id: number): Observable<ResultEntity<void>> {
    return this.http.delete<ResultEntity<void>>(`${this.apiUrl}/commitments`, {
      body: { id },
    });
  }
}
