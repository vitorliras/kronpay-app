import { Connector } from "./connector-dto";

export interface ConnectorsResponse {
  total: number;
  totalPages: number;
  page: number;
  results: Connector[];

}
