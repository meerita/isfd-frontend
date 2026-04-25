/** @format */

import NAVIGATION from '@/_constants/navigation';

const getTargetNavigationUrl = (
  targetType: string,
  target: string
): string | null => {
  const routeMap: Record<string, (uuid: string) => string> = {
    organization: NAVIGATION.ORGANIZATION_BY_UUID,
  };

  const getRoute = routeMap[targetType.toLowerCase()];
  return getRoute ? getRoute(target) : null;
};

export default getTargetNavigationUrl;
