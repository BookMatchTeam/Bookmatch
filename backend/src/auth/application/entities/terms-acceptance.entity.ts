/**
 * Prova de que o usuário aceitou uma versão dos termos de uso e da política
 * de privacidade (RN-06). Cada versão é aceita uma única vez por usuário.
 */
export class TermsAcceptance {
  private constructor(
    readonly id: string,
    readonly userId: string,
    readonly termsVersion: string,
    readonly acceptedAt: Date,
  ) {}

  static accept(data: {
    id: string;
    userId: string;
    termsVersion: string;
    now: Date;
  }): TermsAcceptance {
    return new TermsAcceptance(
      data.id,
      data.userId,
      data.termsVersion,
      data.now,
    );
  }
}
