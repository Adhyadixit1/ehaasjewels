-- Fix RLS policies for order_items table
-- This migration adds the missing Row Level Security policies for the order_items table

-- Users can view order items for their own orders
CREATE POLICY "Users can view own order items" ON public.order_items 
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  ));

-- Admins can manage all order items
CREATE POLICY "Admins can manage order items" ON public.order_items 
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND account_type IN ('admin', 'super_admin')
  ));

-- Allow insert of order items when user can insert orders
CREATE POLICY "Users can insert order items" ON public.order_items 
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  ));