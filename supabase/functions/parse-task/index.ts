
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
    
    if (!taskText || typeof taskText !== 'string') {
      throw new Error('Invalid or missing task text');
    }

    console.log(`Parsing task: "${taskText}"`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are a task parser that extracts structured information from natural language task descriptions. 
                      Extract the following components:
                      1. Task title (required) - A concise title for the task
                      2. Description (optional) - Any additional details about the task
                      3. Priority (optional) - One of: "low", "medium", "high"
                      4. Due date (optional) - Extract any date/time information and convert to ISO string format
                      
                      Return JSON with these fields: 
                      {
                        "title": string,
                        "description": string | null,
                        "priority": "low" | "medium" | "high",
                        "dueDate": ISO string | null
                      }
                      
                      If no priority is specified, default to "medium".
                      For time-related expressions like "tomorrow", "next week", etc., convert to actual dates.`
          },
          { role: 'user', content: taskText }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const extractedInfo = JSON.parse(data.choices[0].message.content);
    console.log('Extracted task info:', extractedInfo);

    return new Response(JSON.stringify(extractedInfo), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error parsing task:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
