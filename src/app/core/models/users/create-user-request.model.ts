export interface CreateUserRequest {
  name: string;
  username: string;
  email: string;
  cpf: string;
  phone: string;
  password: string;
  emailOnCritical?: boolean;
  emailOnImportant?: boolean;
  emailOnInformative?: boolean;
}
