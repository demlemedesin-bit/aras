alter policy "anyone can submit" on public.submissions
  with check (
    status = 'new'
    and stage = 'new'
    and quote_amount is null
    and internal_note is null
    and (items is null or (jsonb_typeof(items) = 'array' and jsonb_array_length(items) <= 200))
    and length(coalesce(message, '')) <= 6000
  );
