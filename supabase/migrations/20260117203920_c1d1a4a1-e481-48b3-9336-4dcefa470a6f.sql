-- Drop the existing overly restrictive policy
DROP POLICY IF EXISTS "Service role only" ON public.rate_limits;

-- Create a new policy that allows service role to manage rate limits
-- This is necessary for the check_rate_limit function to work properly
CREATE POLICY "Service role can manage rate limits"
ON public.rate_limits
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');