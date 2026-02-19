export interface ResultEntity<T> {
  isSuccess: boolean;
  value?: T;
  errorCode?: string;
  message?: string;
}
