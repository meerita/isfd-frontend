/**
 * @format
 * @file src/_constants/domains.ts
 * @description Top-level expertise domains for assessments.
 * @author Diego Martín Lafuente <diego.lafuente@cognativinc.com>
 */

export enum Domain {
  Technology = 'Technology',
  Software = 'Software',
  Web = 'Web',
  Mobile = 'Mobile',
  Data = 'Data',
  AI = 'AI',
  Security = 'Security',
  Cloud = 'Cloud',
  DevOps = 'DevOps',
  Design = 'Design',
  Business = 'Business',
  Finance = 'Finance',
  Marketing = 'Marketing',
  Sales = 'Sales',
  Product = 'Product',
  Operations = 'Operations',
  Leadership = 'Leadership',
  Science = 'Science',
  Math = 'Math',
  Healthcare = 'Healthcare',
}

// For selects / mapping
export const DOMAIN_OPTIONS: Domain[] = Object.values(Domain);
