-- Add restrictive policies to prevent any user from modifying user_roles
-- Only service role (admin functions) should be able to INSERT, UPDATE, or DELETE roles

-- Policy to prevent authenticated users from inserting roles
CREATE POLICY "Prevent user insert into user_roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Policy to prevent authenticated users from updating roles
CREATE POLICY "Prevent user update of user_roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (false);

-- Policy to prevent authenticated users from deleting roles
CREATE POLICY "Prevent user delete from user_roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (false);