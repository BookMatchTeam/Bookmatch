import { EmailAlreadyRegisteredException } from '../exceptions/email-already-registered.exception.js';
import { EmailAlreadyVerifiedException } from '../exceptions/email-already-verified.exception.js';
import type { BrazilianState } from './vo/brazilian-state.vo.js';
import type { City } from './vo/city.vo.js';
import type { Email } from './vo/email.vo.js';
import type { PersonName } from './vo/person-name.vo.js';

/**
 * `PENDING_VERIFICATION` → `ACTIVE` quando o e-mail é confirmado. Não há
 * transição de volta.
 */
export type UserStatus = 'PENDING_VERIFICATION' | 'ACTIVE';

export interface UserProps {
  readonly id: string;
  readonly name: PersonName;
  readonly email: Email;
  readonly passwordHash: string;
  readonly city: City;
  readonly state: BrazilianState;
  readonly status: UserStatus;
  readonly createdAt: Date;
  readonly acceptedTermsVersions: readonly string[];
}

interface SignUpData {
  readonly name: PersonName;
  readonly passwordHash: string;
  readonly city: City;
  readonly state: BrazilianState;
  readonly termsVersion: string;
}

export class User {
  private props: UserProps;

  private constructor(props: UserProps) {
    this.props = props;
  }

  /** Cria a conta pendente de verificação do e-mail (RN-07). */
  static createAccount(
    data: SignUpData & { id: string; email: Email; now: Date },
  ): User {
    return new User({
      id: data.id,
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      city: data.city,
      state: data.state,
      status: 'PENDING_VERIFICATION',
      createdAt: data.now,
      acceptedTermsVersions: [data.termsVersion],
    });
  }

  static restore(props: UserProps): User {
    return new User(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): PersonName {
    return this.props.name;
  }

  get email(): Email {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get city(): City {
    return this.props.city;
  }

  get state(): BrazilianState {
    return this.props.state;
  }

  get status(): UserStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  hasAcceptedTerms(version: string): boolean {
    return this.props.acceptedTermsVersions.includes(version);
  }

  /**
   * Refaz o cadastro de uma conta que ainda não confirmou o e-mail (RN-09).
   * Uma conta ativa não pode ser cadastrada de novo (RN-08).
   */
  redoSignUp(data: SignUpData): void {
    if (this.props.status === 'ACTIVE') {
      throw new EmailAlreadyRegisteredException();
    }

    this.props = {
      ...this.props,
      name: data.name,
      passwordHash: data.passwordHash,
      city: data.city,
      state: data.state,
      acceptedTermsVersions: this.hasAcceptedTerms(data.termsVersion)
        ? this.props.acceptedTermsVersions
        : [...this.props.acceptedTermsVersions, data.termsVersion],
    };
  }

  /** Ativa a conta depois da confirmação do e-mail (RN-18). */
  verifyEmail(): void {
    if (this.props.status === 'ACTIVE') {
      throw new EmailAlreadyVerifiedException();
    }

    this.props = { ...this.props, status: 'ACTIVE' };
  }
}
