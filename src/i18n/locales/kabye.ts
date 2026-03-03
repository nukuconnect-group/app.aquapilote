// Kabyè translations - merged
import { navigation } from './kabye/navigation';
import { common } from './kabye/common';
import { dashboard } from './kabye/dashboard';
import { modules } from './kabye/modules';
import { settings } from './kabye/settings';
import { analytics } from './kabye/analytics';
import { team } from './kabye/team';

export const kabye = {
  ...navigation, ...common, ...dashboard, ...modules, ...settings, ...analytics, ...team,
};
