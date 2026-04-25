/** @format */

// File: src/_types/legal.ts
// Purpose: Shared legal document types for admin and public pages
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

export type LegalDocumentType = 'TERMS' | 'PRIVACY' | 'SUBSCRIPTION';

export type LegalDocumentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type WritableLegalDocumentStatus = 'DRAFT' | 'PUBLISHED';

export type LegalDocumentLanguage = 'EN' | 'ES';

export interface LegalDocumentTranslation {
  readonly id: string;
  readonly language: LegalDocumentLanguage;
  readonly content: string;
  readonly created_at: string;
  readonly updated_at: string;
  readonly status: LegalDocumentStatus;
}

export interface LegalDocument {
  readonly id: string;
  readonly title: string;
  readonly type: LegalDocumentType;
  readonly version: number;
  readonly translations: ReadonlyArray<LegalDocumentTranslation>;
  readonly created_at: string;
  readonly updated_at: string;
  readonly status: LegalDocumentStatus;
}

export interface LegalListResponse {
  readonly data: ReadonlyArray<LegalDocument>;
  readonly pagination: Readonly<{
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  }>;
}

export interface LegalTranslationPayload {
  readonly id?: string;
  readonly language: LegalDocumentLanguage;
  readonly content: string;
}

export interface CreateLegalDocumentPayload {
  readonly title: string;
  readonly type: LegalDocumentType;
  readonly version: number;
  readonly status: WritableLegalDocumentStatus;
  readonly translations?: ReadonlyArray<LegalTranslationPayload>;
}

export interface UpdateLegalDocumentPayload {
  readonly title?: string;
  readonly type?: LegalDocumentType;
  readonly version?: number;
  readonly status?: WritableLegalDocumentStatus;
  readonly translations?: ReadonlyArray<LegalTranslationPayload>;
}

export interface UpdateLegalTranslationPayload {
  readonly language?: LegalDocumentLanguage;
  readonly content?: string;
}

export interface CreateLegalTranslationPayload {
  readonly language: LegalDocumentLanguage;
  readonly content?: string;
}
