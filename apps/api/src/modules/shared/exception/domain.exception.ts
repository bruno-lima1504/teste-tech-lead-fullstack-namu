export type DomainExceptionDetails = Record<string, string[]>;

/**
 * Erro esperado, com código estável para o cliente tratar. A subclasse diz a categoria;
 * quem a traduz em status HTTP é o filtro da borda.
 */
export abstract class DomainException extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly details?: DomainExceptionDetails,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidInputDomainException extends DomainException {}

export class UnauthenticatedDomainException extends DomainException {}

export class NotFoundDomainException extends DomainException {}

export class ConflictDomainException extends DomainException {}

export class BusinessRuleDomainException extends DomainException {}
