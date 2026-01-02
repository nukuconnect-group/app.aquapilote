import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Feeding reminders function triggered at:", new Date().toISOString());

    // Verify scheduler authentication token
    const authHeader = req.headers.get('Authorization');
    const expectedToken = Deno.env.get('CRON_SECRET_TOKEN');
    
    // If CRON_SECRET_TOKEN is set, enforce authentication
    if (expectedToken) {
      if (!authHeader) {
        console.error('Missing authorization header for scheduled function');
        return new Response(
          JSON.stringify({ error: 'Unauthorized - Missing authorization header' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const providedToken = authHeader.replace('Bearer ', '');
      if (providedToken !== expectedToken) {
        console.error('Invalid authorization token for scheduled function');
        return new Response(
          JSON.stringify({ error: 'Unauthorized - Invalid token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('Scheduler authentication verified');
    } else {
      console.warn('CRON_SECRET_TOKEN not configured - function is publicly accessible');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get current time info
    const now = new Date();
    const currentDay = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][now.getDay()];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Format current time for comparison (HH:MM)
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    console.log(`Current day: ${currentDay}, Current time: ${currentTimeStr}`);

    // Fetch all active feeding plans
    const { data: feedingPlans, error: plansError } = await supabase
      .from('feeding_plans')
      .select('*, production_units!inner(name, user_id)')
      .eq('is_active', true);

    if (plansError) {
      console.error("Error fetching feeding plans:", plansError);
      throw plansError;
    }

    if (!feedingPlans || feedingPlans.length === 0) {
      console.log("No active feeding plans found");
      return new Response(
        JSON.stringify({ message: "No active feeding plans", reminders_sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${feedingPlans.length} active feeding plans`);

    let remindersSent = 0;
    const processedUsers = new Set<string>();

    for (const plan of feedingPlans) {
      // Check if today is in the plan's days
      const planDays = plan.days || [];
      if (!planDays.includes(currentDay)) {
        console.log(`Plan ${plan.id} not scheduled for ${currentDay}`);
        continue;
      }

      // Parse plan time
      const planTime = plan.time; // Format: "HH:MM:SS" or "HH:MM"
      if (!planTime) {
        console.log(`Plan ${plan.id} has no time set`);
        continue;
      }

      const [planHour, planMinute] = planTime.split(':').map(Number);
      
      // Calculate time difference in minutes
      const planTotalMinutes = planHour * 60 + planMinute;
      const currentTotalMinutes = currentHour * 60 + currentMinute;
      const timeDiff = planTotalMinutes - currentTotalMinutes;

      // Send reminder 15 minutes before feeding time
      const REMINDER_WINDOW_MIN = 10;
      const REMINDER_WINDOW_MAX = 20;
      
      if (timeDiff >= REMINDER_WINDOW_MIN && timeDiff <= REMINDER_WINDOW_MAX) {
        console.log(`Sending reminder for plan ${plan.id}, scheduled at ${planTime}`);

        const userId = plan.user_id;
        const unitName = plan.production_units?.name || 'Unité inconnue';

        // Check if we already sent a reminder for this plan today
        const today = now.toISOString().split('T')[0];
        const { data: existingNotif } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', userId)
          .eq('module', 'Alimentation')
          .gte('created_at', `${today}T00:00:00`)
          .like('message', `%${planTime.substring(0, 5)}%`)
          .limit(1);

        if (existingNotif && existingNotif.length > 0) {
          console.log(`Reminder already sent for plan ${plan.id} today`);
          continue;
        }

        // Create notification
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            title: '🐟 Rappel de nourrissage',
            message: `Nourrissage prévu à ${planTime.substring(0, 5)} pour ${unitName} - ${plan.feed_type} (${plan.quantity} ${plan.unit})`,
            type: 'info',
            module: 'Alimentation',
            is_critical: false,
            metadata: {
              plan_id: plan.id,
              unit_id: plan.unit_id,
              cycle_id: plan.cycle_id,
              feed_type: plan.feed_type,
              quantity: plan.quantity,
              unit: plan.unit,
              scheduled_time: planTime
            }
          });

        if (notifError) {
          console.error(`Error creating notification for plan ${plan.id}:`, notifError);
        } else {
          console.log(`Notification created for plan ${plan.id}`);
          remindersSent++;
          processedUsers.add(userId);
        }
      }

      // Also check if feeding time has passed and no record exists
      if (timeDiff < -30 && timeDiff > -60) {
        // Feeding time was 30-60 minutes ago, check if record exists
        const today = now.toISOString().split('T')[0];
        
        const { data: feedingRecord } = await supabase
          .from('feeding_records')
          .select('id')
          .eq('unit_id', plan.unit_id)
          .eq('date', today)
          .gte('time', `${planHour.toString().padStart(2, '0')}:${(planMinute - 30).toString().padStart(2, '0')}:00`)
          .lte('time', `${planHour.toString().padStart(2, '0')}:${(planMinute + 30).toString().padStart(2, '0')}:00`)
          .limit(1);

        if (!feedingRecord || feedingRecord.length === 0) {
          // Check if we already sent a missed feeding notification
          const { data: existingMissedNotif } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', plan.user_id)
            .eq('module', 'Alimentation')
            .eq('type', 'warning')
            .gte('created_at', `${today}T00:00:00`)
            .like('message', `%${planTime.substring(0, 5)}%manqué%`)
            .limit(1);

          if (!existingMissedNotif || existingMissedNotif.length === 0) {
            console.log(`Missed feeding detected for plan ${plan.id}`);
            
            const unitName = plan.production_units?.name || 'Unité inconnue';
            
            const { error: missedNotifError } = await supabase
              .from('notifications')
              .insert({
                user_id: plan.user_id,
                title: '⚠️ Nourrissage manqué',
                message: `Le nourrissage de ${planTime.substring(0, 5)} pour ${unitName} semble avoir été manqué`,
                type: 'warning',
                module: 'Alimentation',
                is_critical: true,
                metadata: {
                  plan_id: plan.id,
                  unit_id: plan.unit_id,
                  feed_type: plan.feed_type,
                  scheduled_time: planTime,
                  missed: true
                }
              });

            if (missedNotifError) {
              console.error(`Error creating missed feeding notification:`, missedNotifError);
            } else {
              remindersSent++;
            }
          }
        }
      }
    }

    console.log(`Feeding reminders complete. Sent ${remindersSent} notification(s)`);

    return new Response(
      JSON.stringify({
        message: `Successfully processed feeding plans`,
        reminders_sent: remindersSent,
        plans_checked: feedingPlans.length,
        timestamp: now.toISOString()
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in feeding-reminders function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
