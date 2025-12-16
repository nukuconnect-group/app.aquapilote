import { supabase } from '@/integrations/supabase/client';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  module: string;
  isCritical?: boolean;
  metadata?: Record<string, any>;
}

export const createNotification = async (params: CreateNotificationParams): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: params.userId,
        title: params.title,
        message: params.message,
        type: params.type,
        module: params.module,
        is_critical: params.isCritical || false,
        metadata: params.metadata || {},
      });

    if (error) {
      console.error('Error creating notification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
};

export const createBatchNotifications = async (
  notifications: CreateNotificationParams[]
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert(
        notifications.map(n => ({
          user_id: n.userId,
          title: n.title,
          message: n.message,
          type: n.type,
          module: n.module,
          is_critical: n.isCritical || false,
          metadata: n.metadata || {},
        }))
      );

    if (error) {
      console.error('Error creating batch notifications:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error creating batch notifications:', error);
    return false;
  }
};

// Utility to create common notification types
export const notificationHelpers = {
  stockAlert: (userId: string, stockName: string, currentQty: number, threshold: number) =>
    createNotification({
      userId,
      title: 'Stock bas',
      message: `Le stock de ${stockName} est bas (${currentQty}). Seuil minimum: ${threshold}`,
      type: 'warning',
      module: 'Alimentation',
      isCritical: currentQty === 0,
      metadata: { stockName, currentQty, threshold },
    }),

  temperatureAlert: (userId: string, basinName: string, temperature: number, threshold: number) =>
    createNotification({
      userId,
      title: 'Température anormale',
      message: `La température de ${basinName} est de ${temperature}°C (seuil: ${threshold}°C)`,
      type: temperature > threshold ? 'error' : 'warning',
      module: 'Surveillance',
      isCritical: Math.abs(temperature - threshold) > 5,
      metadata: { basinName, temperature, threshold },
    }),

  oxygenAlert: (userId: string, basinName: string, oxygen: number, threshold: number) =>
    createNotification({
      userId,
      title: 'Niveau d\'oxygène critique',
      message: `Le niveau d'oxygène de ${basinName} est de ${oxygen} mg/L (minimum: ${threshold} mg/L)`,
      type: 'error',
      module: 'Surveillance',
      isCritical: true,
      metadata: { basinName, oxygen, threshold },
    }),

  mortalityAlert: (userId: string, basinName: string, mortalityRate: number) =>
    createNotification({
      userId,
      title: 'Mortalité élevée détectée',
      message: `Taux de mortalité anormal détecté dans ${basinName}: ${mortalityRate.toFixed(1)}%`,
      type: 'error',
      module: 'Santé',
      isCritical: mortalityRate > 5,
      metadata: { basinName, mortalityRate },
    }),

  feedingReminder: (userId: string, basinName: string, time: string) =>
    createNotification({
      userId,
      title: 'Rappel nourrissage',
      message: `Nourrissage prévu pour ${basinName} à ${time}`,
      type: 'info',
      module: 'Alimentation',
      isCritical: false,
      metadata: { basinName, time },
    }),

  cycleAlert: (userId: string, cycleName: string, message: string, isCritical: boolean = false) =>
    createNotification({
      userId,
      title: 'Alerte cycle de production',
      message: `${cycleName}: ${message}`,
      type: isCritical ? 'error' : 'warning',
      module: 'Production',
      isCritical,
      metadata: { cycleName },
    }),

  teamMemberAdded: (userId: string, memberName: string) =>
    createNotification({
      userId,
      title: 'Nouveau membre ajouté',
      message: `${memberName} a été ajouté à votre équipe`,
      type: 'success',
      module: 'Équipe',
      isCritical: false,
      metadata: { memberName },
    }),

  systemAlert: (userId: string, title: string, message: string, isCritical: boolean = false) =>
    createNotification({
      userId,
      title,
      message,
      type: isCritical ? 'error' : 'info',
      module: 'Système',
      isCritical,
    }),
};
