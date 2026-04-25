/** @format */

// File: global.ts
// Purpose: Application-level metadata for layout
// Author: Diego M. Lafuente
// Email: diego.lafuente@cognativinc.com

const GLOBALS = {
  metadata: {
    title: 'Sport App',
    description:
      'Sport App is the best platform to create assessments online and manage campaigns for hiring or internal assessments using AI.',
  },
  html: {
    lang: 'en',
  },
  website: process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000',
};

export default GLOBALS;
