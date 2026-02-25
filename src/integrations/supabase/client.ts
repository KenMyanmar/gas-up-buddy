import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = 'https://rtbkhrenswgzhuzltpgd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0YmtocmVuc3dnemh1emx0cGdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MDQ5MzUsImV4cCI6MjA4MzE4MDkzNX0.LCiLmrWtv-i1Ko8I4QXjbOYTRXrF8aqK_EATqfcXQmk';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
