-- Mettre à jour le rôle de l'utilisateur komisenaa1@gmail.com vers admin
UPDATE public.user_roles 
SET role = 'admin'::app_role 
WHERE user_id = '84f4d92d-2d2c-4244-95be-ad3fb532e014';