-- Add country and device_type columns to user_sessions table
ALTER TABLE public.user_sessions 
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS device_type TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS device_info TEXT DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.user_sessions.country IS 'Country name detected from IP address';
COMMENT ON COLUMN public.user_sessions.country_code IS 'ISO 3166-1 alpha-2 country code';
COMMENT ON COLUMN public.user_sessions.device_type IS 'Device type: phone, tablet, desktop, other';
COMMENT ON COLUMN public.user_sessions.device_info IS 'Additional device information from user agent';