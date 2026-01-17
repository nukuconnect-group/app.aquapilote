import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
    console.log("Task reminders function triggered at:", new Date().toISOString());

    // Verify scheduler authentication token - MANDATORY
    const authHeader = req.headers.get('Authorization');
    const expectedToken = Deno.env.get('CRON_SECRET_TOKEN');
    
    // CRON_SECRET_TOKEN is required for security
    if (!expectedToken) {
      console.error('CRON_SECRET_TOKEN not configured - rejecting request for security');
      return new Response(
        JSON.stringify({ error: 'Server configuration error - CRON_SECRET_TOKEN not set' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get current time info
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const today = now.toISOString().split('T')[0];
    
    // Format current time for comparison (HH:MM)
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    console.log(`Current date: ${today}, Current time: ${currentTimeStr}`);

    // Fetch all pending tasks for today that haven't had alerts sent
    const { data: tasks, error: tasksError } = await supabase
      .from('planned_tasks')
      .select('*')
      .eq('due_date', today)
      .eq('status', 'pending')
      .eq('alert_sent', false)
      .in('priority', ['high', 'urgent']); // Only high priority tasks get email reminders

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError);
      throw tasksError;
    }

    if (!tasks || tasks.length === 0) {
      console.log("No pending high-priority tasks for today");
      return new Response(
        JSON.stringify({ message: "No pending tasks to remind", reminders_sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${tasks.length} pending high-priority tasks`);

    let remindersSent = 0;
    const emailsSent: string[] = [];

    for (const task of tasks) {
      // Parse task time
      const taskTime = task.due_time; // Format: "HH:MM" or "HH:MM:SS"
      if (!taskTime) {
        console.log(`Task ${task.id} has no time set`);
        continue;
      }

      const [taskHour, taskMinute] = taskTime.split(':').map(Number);
      
      // Calculate time difference in minutes
      const taskTotalMinutes = taskHour * 60 + taskMinute;
      const currentTotalMinutes = currentHour * 60 + currentMinute;
      const timeDiff = taskTotalMinutes - currentTotalMinutes;

      // Send reminder 15-30 minutes before task time
      const REMINDER_WINDOW_MIN = 10;
      const REMINDER_WINDOW_MAX = 35;
      
      if (timeDiff >= REMINDER_WINDOW_MIN && timeDiff <= REMINDER_WINDOW_MAX) {
        console.log(`Processing reminder for task ${task.id}, scheduled at ${taskTime}`);

        // Get user profile to get email
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', task.user_id)
          .single();

        if (profileError || !profile) {
          console.error(`Error fetching profile for user ${task.user_id}:`, profileError);
          continue;
        }

        const userName = profile.full_name || 'Utilisateur';
        const userEmail = profile.email;

        if (!userEmail) {
          console.log(`No email for user ${task.user_id}`);
          continue;
        }

        // Create in-app notification
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: task.user_id,
            title: `⏰ Rappel: ${task.title}`,
            message: `Tâche prévue à ${taskTime.substring(0, 5)} - ${task.description || 'Pas de description'}`,
            type: task.priority === 'urgent' ? 'error' : 'warning',
            module: 'Planification',
            is_critical: task.priority === 'urgent',
            metadata: {
              task_id: task.id,
              task_type: task.type,
              priority: task.priority,
              unit_id: task.unit_id,
              scheduled_time: taskTime
            }
          });

        if (notifError) {
          console.error(`Error creating notification for task ${task.id}:`, notifError);
        }

        // Send email reminder
        try {
          const priorityLabel = task.priority === 'urgent' ? '🔴 URGENT' : '🟠 Important';
          const unitInfo = task.unit_name ? ` - Unité: ${task.unit_name}` : '';
          
          const emailResponse = await resend.emails.send({
            from: "AquaPilote <onboarding@resend.dev>",
            to: [userEmail],
            subject: `${priorityLabel} - Rappel: ${task.title}`,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">🐟 AquaPilote</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Rappel de tâche planifiée</p>
                  </div>
                  
                  <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
                      Bonjour <strong>${userName}</strong>,
                    </p>
                    
                    <div style="background: ${task.priority === 'urgent' ? '#fef2f2' : '#fff7ed'}; border-left: 4px solid ${task.priority === 'urgent' ? '#ef4444' : '#f97316'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 18px;">
                        ${priorityLabel}
                      </h2>
                      <h3 style="color: #374151; margin: 0 0 10px 0; font-size: 20px;">
                        ${task.title}
                      </h3>
                      <p style="color: #6b7280; margin: 0;">
                        ${task.description || 'Pas de description supplémentaire'}
                      </p>
                    </div>
                    
                    <div style="display: flex; gap: 20px; margin: 25px 0;">
                      <div style="flex: 1; background: #f9fafb; padding: 15px; border-radius: 8px; text-align: center;">
                        <p style="color: #6b7280; margin: 0 0 5px 0; font-size: 12px; text-transform: uppercase;">Heure prévue</p>
                        <p style="color: #1f2937; margin: 0; font-size: 20px; font-weight: bold;">⏰ ${taskTime.substring(0, 5)}</p>
                      </div>
                      <div style="flex: 1; background: #f9fafb; padding: 15px; border-radius: 8px; text-align: center;">
                        <p style="color: #6b7280; margin: 0 0 5px 0; font-size: 12px; text-transform: uppercase;">Type</p>
                        <p style="color: #1f2937; margin: 0; font-size: 16px; font-weight: bold;">📋 ${task.type || 'Général'}</p>
                      </div>
                    </div>
                    
                    ${task.unit_name ? `
                    <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                      <p style="color: #0369a1; margin: 0; font-size: 14px;">
                        <strong>📍 Unité de production:</strong> ${task.unit_name}
                      </p>
                    </div>
                    ` : ''}
                    
                    <p style="color: #6b7280; font-size: 14px; margin: 25px 0 0 0; text-align: center;">
                      Cette tâche est prévue dans environ ${timeDiff} minutes.
                    </p>
                  </div>
                  
                  <div style="text-align: center; padding: 20px;">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                      Cet email a été envoyé automatiquement par AquaPilote.<br>
                      © ${new Date().getFullYear()} AquaPilote - Gestion Aquacole Intelligente
                    </p>
                  </div>
                </div>
              </body>
              </html>
            `,
          });

          console.log(`Email sent to ${userEmail} for task ${task.id}:`, emailResponse);
          emailsSent.push(userEmail);
          remindersSent++;

          // Mark alert as sent
          const { error: updateError } = await supabase
            .from('planned_tasks')
            .update({ alert_sent: true })
            .eq('id', task.id);

          if (updateError) {
            console.error(`Error updating alert_sent for task ${task.id}:`, updateError);
          }

        } catch (emailError: any) {
          console.error(`Error sending email for task ${task.id}:`, emailError);
        }
      }
    }

    console.log(`Task reminders complete. Sent ${remindersSent} email(s)`);

    return new Response(
      JSON.stringify({
        message: `Successfully processed task reminders`,
        reminders_sent: remindersSent,
        emails_sent: emailsSent,
        tasks_checked: tasks.length,
        timestamp: now.toISOString()
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in task-reminders function:", error);
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
