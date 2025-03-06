
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { taskText } = await req.json();
    
    if (!taskText || taskText.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Task text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare the system prompt that explains how to parse the task
    const systemPrompt = `
    You are a task parsing assistant. Extract the following information from the user's task description:
    1. Task title (short but descriptive)
    2. Description (additional details if available)
    3. Priority (low, medium, or high)
    4. Due date (in ISO format if a date/time is mentioned)

    Respond with JSON only in the following format:
    {
      "title": "Task title",
      "description": "Additional description or null if not provided",
      "priority": "low|medium|high",
      "dueDate": "YYYY-MM-DDTHH:MM:SS.sssZ or null if no date mentioned"
    }

    For priority:
    - If urgency is explicitly mentioned (urgent, asap, etc.), set priority to "high"
    - If something is described as "not urgent" or "when you have time", set priority to "low"
    - Default to "medium" if no priority indicators are found

    For due date:
    - Convert relative dates (tomorrow, next Monday, etc.) to absolute dates
    - If a specific time is mentioned, include it
    - If no time is specified but a date is, use 23:59:59 as the default time
    - Return null if no date information is provided
    `;

    // Make the API call to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: taskText }
        ],
        temperature: 0.1, // Lower temperature for more consistent results
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Error communicating with OpenAI', details: errorData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    let parsedResult;
    
    try {
      // Try to parse the response from OpenAI
      const content = data.choices[0].message.content;
      parsedResult = JSON.parse(content);
      
      // Validate the structure of the parsed JSON
      if (!parsedResult.title) {
        parsedResult.title = "New Task";
      }
      
      if (!['low', 'medium', 'high'].includes(parsedResult.priority)) {
        parsedResult.priority = "medium";
      }
      
      // Ensure dueDate is either a valid ISO date string or null
      if (parsedResult.dueDate && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(parsedResult.dueDate)) {
        try {
          parsedResult.dueDate = new Date(parsedResult.dueDate).toISOString();
        } catch (e) {
          console.log("Error parsing date:", e);
          parsedResult.dueDate = null;
        }
      }
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      console.log('Raw OpenAI response:', data);
      
      // Fallback to a default structure if parsing fails
      parsedResult = {
        title: "New Task",
        description: taskText,
        priority: "medium",
        dueDate: null
      };
    }

    return new Response(
      JSON.stringify(parsedResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in parse-task function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
