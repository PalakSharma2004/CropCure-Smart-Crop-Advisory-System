-- Fix educational_content RLS - add restrictive policies for INSERT, UPDATE, DELETE
-- Only admin users should be able to modify content (using service role)

CREATE POLICY "Prevent user insert into educational_content"
ON public.educational_content
FOR INSERT
WITH CHECK (false);

CREATE POLICY "Prevent user update of educational_content"
ON public.educational_content
FOR UPDATE
USING (false);

CREATE POLICY "Prevent user delete from educational_content"
ON public.educational_content
FOR DELETE
USING (false);

-- Add UPDATE policy for chat_conversations to prevent unauthorized modifications
CREATE POLICY "Users cannot update conversations"
ON public.chat_conversations
FOR UPDATE
USING (false);