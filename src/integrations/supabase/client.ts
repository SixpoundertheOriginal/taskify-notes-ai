// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ushpwfrxznjbddpicujy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzaHB3ZnJ4em5qYmRkcGljdWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyNjIyMjcsImV4cCI6MjA1NjgzODIyN30.MMojxAzt922wr3co3njFk39R8NBkfWPmWMs6sdMgxOc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);