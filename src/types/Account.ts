export enum AccountType {
    User = "User",
    Admin = "Admin"
  }

export interface Account {
  username: string;
  password: string;
  type: AccountType;
}
