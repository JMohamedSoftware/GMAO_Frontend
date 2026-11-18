/**
 * ============================================================================
 * MODULE : Campagnes & Saisons Industrielles - Page Principale
 * ============================================================================
 * Vue dédiée à l'administration des saisons de production pour l'usine.
 */

import React from 'react';
import { CampaignSettings } from '../components/CampaignSettings';

export const CampaignsPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 flex flex-col gap-6">
      <CampaignSettings />
    </div>
  );
};
