-- Fix security issue: set search_path for the function
CREATE OR REPLACE FUNCTION check_and_send_stock_alert()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  project_url TEXT := 'https://hhsvraqchtqqgaezhnzn.supabase.co';
  anon_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhoc3ZyYXFjaHRxcWdhZXpobnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMTQ0OTUsImV4cCI6MjA3NzY5MDQ5NX0.yPX0oLUaW5L2_d43MB7X8xpwPaTGCMDNsWKx9JbGrbA';
BEGIN
  -- Vérifier si le stock est en dessous du seuil après l'UPDATE
  IF NEW.quantity <= COALESCE(NEW.min_threshold, 50) THEN
    -- Appeler l'edge function de manière asynchrone via pg_net
    PERFORM extensions.net.http_post(
      url := project_url || '/functions/v1/send-stock-alert',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || anon_key
      ),
      body := jsonb_build_object(
        'stock_id', NEW.id,
        'user_id', NEW.user_id
      )
    );
    
    RAISE NOTICE 'Stock alert triggered for stock_id: %, quantity: %, threshold: %', 
      NEW.id, NEW.quantity, COALESCE(NEW.min_threshold, 50);
  END IF;
  
  RETURN NEW;
END;
$$;