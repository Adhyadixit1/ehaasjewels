# Fix for Visitor Analytics Functions

This document explains how to fix the 400 Bad Request error when calling the `get_or_create_visitor_session` RPC function.

## Problem

The 400 Bad Request error occurs due to:
1. Ambiguous column reference 'session_id' (when multiple tables have this column)
2. Inconsistencies in the database function definitions
3. Potential schema issues

## Solution

1. Apply the comprehensive fix script (Version 2):
   ```sql
   -- Run the comprehensive fix script
   \i database/comprehensive_fix_visitor_analytics_v2.sql
   ```

2. Test the functions:
   ```sql
   -- Run the test script to verify the fix
   \i database/test_fixed_functions_v2.sql
   ```

## What the Fix Does

1. Ensures all required columns exist in the `visitor_analytics` table
2. Drops existing conflicting function definitions
3. Recreates functions with proper error handling and validation
4. Properly qualifies table references to avoid column ambiguity
5. Adds security definer to ensure proper permissions
6. Improves error messages for better debugging

## Key Improvements in Version 2

- Fixed column ambiguity by properly qualifying table references with `va.` alias
- Added explicit table aliases in all queries to prevent conflicts with other tables that have similar column names
- Maintained all previous improvements from Version 1

## Verification

After applying the fix, you should no longer see the 400 Bad Request error when:
1. Loading any page (triggers page view tracking)
2. Adding items to cart (triggers cart addition tracking)
3. Initiating checkout (triggers checkout initiation tracking)
4. Completing an order (triggers completed order tracking)

## Troubleshooting

If you still encounter issues:

1. Check the browser console for detailed error messages
2. Verify the function exists in the database:
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'get_or_create_visitor_session';
   ```

3. Check the table structure:
   ```sql
   \d visitor_analytics
   ```

4. Test the function directly in the database:
   ```sql
   SELECT * FROM public.get_or_create_visitor_session(
       'test_session_001',
       '00000000-0000-0000-0000-000000000000',
       NULL,
       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
       'http://localhost:8080/test',
       'desktop',
       'IN'
   );
   ```