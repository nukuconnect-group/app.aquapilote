// Unified Supabase client export
//
// IMPORTANT:
// - We export a single configured client (clientConfig) to avoid multiple GoTrueClient
//   instances and LockManager issues (especially on iOS).
// - Always import from this file in app code: import { supabase } from "@/integrations/supabase/client";

export { supabase } from "./clientConfig";
export type { Database } from "./types";