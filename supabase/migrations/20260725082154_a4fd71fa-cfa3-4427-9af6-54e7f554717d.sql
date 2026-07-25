ALTER TABLE public.sales DROP CONSTRAINT IF EXISTS sales_document_type_check;
ALTER TABLE public.sales ADD CONSTRAINT sales_document_type_check CHECK (document_type = ANY (ARRAY['receipt'::text, 'invoice'::text, 'proforma'::text]));

ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS client_request_id text;
CREATE UNIQUE INDEX IF NOT EXISTS sales_user_client_request_unique ON public.sales (user_id, client_request_id) WHERE client_request_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.create_sale_idempotent(
  _client_request_id text,
  _unit_id text,
  _date date,
  _client_name text,
  _client_contact text,
  _total_amount numeric,
  _status text,
  _payment_method text,
  _notes text,
  _due_date date,
  _is_credit boolean,
  _paid_amount numeric,
  _payment_terms text,
  _document_type text,
  _document_number text,
  _tax_rate numeric,
  _items jsonb
)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  unit_id text,
  date date,
  client_name text,
  client_contact text,
  total_amount numeric,
  status text,
  payment_method text,
  notes text,
  created_at timestamptz,
  updated_at timestamptz,
  due_date date,
  is_credit boolean,
  paid_amount numeric,
  payment_terms text,
  document_type text,
  document_number text,
  tax_rate numeric,
  sale_items jsonb
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_sale_id uuid;
  v_existing_id uuid;
  v_type text := COALESCE(NULLIF(_document_type, ''), 'receipt');
  v_prefix text;
  v_year int := EXTRACT(YEAR FROM COALESCE(_date, CURRENT_DATE))::int;
  v_doc text := NULLIF(_document_number, '');
  v_seq int;
  v_candidate text;
  v_attempt int := 0;
  v_items jsonb := COALESCE(_items, '[]'::jsonb);
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'authentication required' USING ERRCODE = '42501';
  END IF;

  IF _client_request_id IS NOT NULL THEN
    SELECT s.id INTO v_existing_id
    FROM public.sales s
    WHERE s.user_id = v_user_id
      AND s.client_request_id = _client_request_id
    LIMIT 1;

    IF v_existing_id IS NOT NULL THEN
      RETURN QUERY
      SELECT
        s.id, s.user_id, s.unit_id, s.date, s.client_name, s.client_contact,
        s.total_amount, s.status, s.payment_method, s.notes, s.created_at, s.updated_at,
        s.due_date, s.is_credit, s.paid_amount, s.payment_terms, s.document_type,
        s.document_number, s.tax_rate,
        COALESCE(jsonb_agg(to_jsonb(si) ORDER BY si.created_at) FILTER (WHERE si.id IS NOT NULL), '[]'::jsonb) AS sale_items
      FROM public.sales s
      LEFT JOIN public.sale_items si ON si.sale_id = s.id
      WHERE s.id = v_existing_id
      GROUP BY s.id;
      RETURN;
    END IF;
  END IF;

  IF v_type NOT IN ('receipt', 'invoice', 'proforma') THEN
    RAISE EXCEPTION 'invalid document type' USING ERRCODE = '22023';
  END IF;

  v_prefix := CASE v_type WHEN 'invoice' THEN 'FAC' WHEN 'proforma' THEN 'PRO' ELSE 'REC' END;

  LOOP
    BEGIN
      IF v_doc IS NULL OR v_attempt > 0 THEN
        SELECT COALESCE(MAX((regexp_match(s.document_number, ('^' || v_prefix || '-' || v_year || '-([0-9]+)$')))[1]::int), 0) + 1
        INTO v_seq
        FROM public.sales s
        WHERE s.user_id = v_user_id
          AND s.document_type = v_type
          AND s.document_number ~ ('^' || v_prefix || '-' || v_year || '-[0-9]+$');

        v_candidate := v_prefix || '-' || v_year || '-' || lpad((v_seq + v_attempt)::text, 4, '0');
      ELSE
        v_candidate := v_doc;
      END IF;

      INSERT INTO public.sales (
        user_id, unit_id, date, client_name, client_contact, total_amount, status,
        payment_method, notes, due_date, is_credit, paid_amount, payment_terms,
        document_type, document_number, tax_rate, client_request_id
      ) VALUES (
        v_user_id, _unit_id, COALESCE(_date, CURRENT_DATE), _client_name, _client_contact,
        COALESCE(_total_amount, 0), COALESCE(_status, 'confirmed'), _payment_method, _notes,
        _due_date, COALESCE(_is_credit, false), COALESCE(_paid_amount, 0), _payment_terms,
        v_type, v_candidate, COALESCE(_tax_rate, 0), _client_request_id
      )
      RETURNING sales.id INTO v_sale_id;

      EXIT;
    EXCEPTION WHEN unique_violation THEN
      v_attempt := v_attempt + 1;
      IF v_attempt > 25 THEN
        RAISE;
      END IF;
    END;
  END LOOP;

  INSERT INTO public.sale_items (user_id, sale_id, name, quantity, unit_price, total)
  SELECT
    v_user_id,
    v_sale_id,
    trim(item->>'name'),
    COALESCE((item->>'quantity')::numeric, 0),
    COALESCE((item->>'unitPrice')::numeric, 0),
    COALESCE((item->>'total')::numeric, 0)
  FROM jsonb_array_elements(v_items) AS item
  WHERE trim(COALESCE(item->>'name', '')) <> '';

  RETURN QUERY
  SELECT
    s.id, s.user_id, s.unit_id, s.date, s.client_name, s.client_contact,
    s.total_amount, s.status, s.payment_method, s.notes, s.created_at, s.updated_at,
    s.due_date, s.is_credit, s.paid_amount, s.payment_terms, s.document_type,
    s.document_number, s.tax_rate,
    COALESCE(jsonb_agg(to_jsonb(si) ORDER BY si.created_at) FILTER (WHERE si.id IS NOT NULL), '[]'::jsonb) AS sale_items
  FROM public.sales s
  LEFT JOIN public.sale_items si ON si.sale_id = s.id
  WHERE s.id = v_sale_id
  GROUP BY s.id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_sale_idempotent(text, text, date, text, text, numeric, text, text, text, date, boolean, numeric, text, text, text, numeric, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_sale_idempotent(text, text, date, text, text, numeric, text, text, text, date, boolean, numeric, text, text, text, numeric, jsonb) TO service_role;