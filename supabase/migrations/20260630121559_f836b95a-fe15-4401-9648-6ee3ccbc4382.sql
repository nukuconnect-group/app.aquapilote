
-- disease-images
CREATE POLICY "disease_imgs_read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'disease-images');
CREATE POLICY "disease_imgs_admin_write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'disease-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "disease_imgs_admin_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'disease-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "disease_imgs_admin_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'disease-images' AND public.has_role(auth.uid(),'admin'));

-- premium-library
CREATE POLICY "lib_read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'premium-library');
CREATE POLICY "lib_admin_write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'premium-library' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "lib_admin_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'premium-library' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "lib_admin_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'premium-library' AND public.has_role(auth.uid(),'admin'));
