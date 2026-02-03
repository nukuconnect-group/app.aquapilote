/**
 * Detect device type from user agent string
 */
export interface DeviceInfo {
  deviceType: 'phone' | 'tablet' | 'desktop' | 'other';
  deviceInfo: string;
}

export const detectDevice = (userAgent: string = navigator.userAgent): DeviceInfo => {
  const ua = userAgent.toLowerCase();
  
  // Detect tablets first (before phones since some tablets contain phone keywords)
  const isTablet = 
    /ipad/.test(ua) ||
    /android(?!.*mobile)/.test(ua) ||
    /tablet/.test(ua) ||
    /kindle/.test(ua) ||
    /silk/.test(ua) ||
    /playbook/.test(ua);
  
  // Detect phones
  const isPhone = 
    /iphone/.test(ua) ||
    /android.*mobile/.test(ua) ||
    /windows phone/.test(ua) ||
    /blackberry/.test(ua) ||
    /bb10/.test(ua) ||
    /opera mini/.test(ua) ||
    /mobile/.test(ua);
  
  // Get browser info
  let browser = 'Unknown';
  if (/edg/.test(ua)) browser = 'Edge';
  else if (/chrome/.test(ua)) browser = 'Chrome';
  else if (/firefox/.test(ua)) browser = 'Firefox';
  else if (/safari/.test(ua)) browser = 'Safari';
  else if (/opera|opr/.test(ua)) browser = 'Opera';
  else if (/msie|trident/.test(ua)) browser = 'Internet Explorer';
  
  // Get OS info
  let os = 'Unknown';
  if (/iphone|ipad|ipod/.test(ua)) os = 'iOS';
  else if (/android/.test(ua)) os = 'Android';
  else if (/windows/.test(ua)) os = 'Windows';
  else if (/mac/.test(ua)) os = 'macOS';
  else if (/linux/.test(ua)) os = 'Linux';
  
  let deviceType: DeviceInfo['deviceType'];
  if (isTablet) deviceType = 'tablet';
  else if (isPhone) deviceType = 'phone';
  else deviceType = 'desktop';
  
  return {
    deviceType,
    deviceInfo: `${browser} on ${os}`
  };
};

/**
 * Get device type label for display
 */
export const getDeviceTypeLabel = (deviceType: string, lang: 'fr' | 'en' = 'fr'): string => {
  const labels: Record<string, { fr: string; en: string }> = {
    phone: { fr: 'Téléphone', en: 'Phone' },
    tablet: { fr: 'Tablette', en: 'Tablet' },
    desktop: { fr: 'Ordinateur', en: 'Desktop' },
    other: { fr: 'Autre', en: 'Other' }
  };
  
  return labels[deviceType]?.[lang] || deviceType;
};

/**
 * Get device type icon name
 */
export const getDeviceTypeIcon = (deviceType: string): string => {
  const icons: Record<string, string> = {
    phone: 'Smartphone',
    tablet: 'Tablet',
    desktop: 'Monitor',
    other: 'HelpCircle'
  };
  
  return icons[deviceType] || 'HelpCircle';
};
