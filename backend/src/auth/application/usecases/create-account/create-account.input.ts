export interface CreateAccountInput {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly city: string;
  readonly state: string;
  readonly acceptedTerms: boolean;
}
