/** @format */

// File: src/_types/ShortUserProfile.ts
// Purpose: Shared compact user shape for list and navigation components
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

type ShortUserProfile = Readonly<{
  username: string;
  avatar?: string;
  tag?: string;
}>;

export default ShortUserProfile;
