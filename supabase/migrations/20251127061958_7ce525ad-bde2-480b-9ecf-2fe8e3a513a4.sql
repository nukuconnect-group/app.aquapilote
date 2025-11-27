-- Enable the pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create a function to check and send stock alerts
CREATE OR REPLACE FUNCTION check_and_send_stock_alert()
RETURNS TRIGGER AS $$
DECLARE
  project_url TEXT := 'https://hhsvraqchtqqgaezhnzn.supabase.co';
  service_role_key TEXT := current_setting('app.settings.service_role_key', true);
BEGIN
  -- Vérifier si le stock est en dessous du seuil après l'UPDATE
  IF NEW.quantity <= COALESCE(NEW.min_threshold, 50) THEN
    -- Appeler l'edge function de manière asynchrone via pg_net
    PERFORM net.http_post(
      url := project_url || '/functions/v1/send-stock-alert',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function after UPDATE on feed_stocks
DROP TRIGGER IF EXISTS trigger_check_stock_alert ON public.feed_stocks;
CREATE TRIGGER trigger_check_stock_alert
  AFTER UPDATE OF quantity
  ON public.feed_stocks
  FOR EACH ROW
  EXECUTE FUNCTION check_and_send_stock_alert();

-- Optionally, also trigger on INSERT for new stocks that are already low
DROP TRIGGER IF EXISTS trigger_check_stock_alert_insert ON public.feed_stocks;
CREATE TRIGGER trigger_check_stock_alert_insert
  AFTER INSERT
  ON public.feed_stocks
  FOR EACH ROW
  WHEN (NEW.quantity <= COALESCE(NEW.min_threshold, 50))
  EXECUTE FUNCTION check_and_send_stock_alert();