import { Campus } from './UserIdentity';

export const DEFAULT_CAMPUSES: Campus[] = [
  {
    id: 'campus-main',
    organizationId: 'org-central-high',
    name: 'Main Academic Campus (Nerul East)',
    code: 'MAIN-01',
    location: 'Navi Mumbai, MH',
    centerLat: 19.0435,
    centerLng: 73.0230,
    isMainCampus: true,
  },
  {
    id: 'campus-[#2]',
    organizationId: 'org-central-high',
    name: 'South Extension Sports Complex',
    code: 'SOUTH-02',
    location: 'Navi Mumbai, MH',
    centerLat: 19.0410,
    centerLng: 73.0210,
    isMainCampus: false,
  },
];
