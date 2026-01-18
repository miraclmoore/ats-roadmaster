import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get user and their stats
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's job data
    const { data: jobs } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', user.id)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(20);

    // Calculate stats
    const totalJobs = jobs?.length || 0;
    const totalIncome = jobs?.reduce((sum, j) => sum + (j.income || 0), 0) || 0;
    const totalProfit = jobs?.reduce((sum, j) => sum + (j.profit || 0), 0) || 0;
    const avgProfit = totalJobs > 0 ? totalProfit / totalJobs : 0;

    // Route profitability
    const routeStats = jobs?.reduce((acc: any, job) => {
      const route = `${job.source_city} → ${job.destination_city}`;
      if (!acc[route]) {
        acc[route] = { totalProfit: 0, count: 0 };
      }
      acc[route].totalProfit += job.profit || 0;
      acc[route].count += 1;
      return acc;
    }, {});

    const topRoutes = Object.entries(routeStats || {})
      .map(([route, stats]: [string, any]) => ({
        route,
        avgProfit: Math.round(stats.totalProfit / stats.count),
        count: stats.count,
      }))
      .sort((a, b) => b.avgProfit - a.avgProfit)
      .slice(0, 5);

    // Cargo profitability
    const cargoStats = jobs?.reduce((acc: any, job) => {
      if (!acc[job.cargo_type]) {
        acc[job.cargo_type] = { totalProfit: 0, count: 0 };
      }
      acc[job.cargo_type].totalProfit += job.profit || 0;
      acc[job.cargo_type].count += 1;
      return acc;
    }, {});

    const topCargo = Object.entries(cargoStats || {})
      .map(([cargo, stats]: [string, any]) => ({
        cargo,
        avgProfit: Math.round(stats.totalProfit / stats.count),
        count: stats.count,
      }))
      .sort((a, b) => b.avgProfit - a.avgProfit)
      .slice(0, 5);

    // Build context for AI
    const context = `You are Roadie, an AI dispatcher on CB Radio Channel 19. You're helping a trucker optimize their routes in American Truck Simulator.

PERSONALITY:
- Experienced trucker who knows the profitable routes
- Use CB radio lingo naturally (10-4, good buddy, breaker breaker, keep the shiny side up)
- Be concise - truckers are busy on the road
- Focus on profit and efficiency
- End messages with CB sign-offs

DRIVER'S PERFORMANCE:
- Jobs Completed: ${totalJobs}
- Total Income: $${totalIncome.toLocaleString()}
- Net Profit: $${totalProfit.toLocaleString()}
- Avg Profit/Job: $${Math.round(avgProfit).toLocaleString()}

${topRoutes.length > 0 ? `MOST PROFITABLE ROUTES:
${topRoutes.map((r, i) => `${i + 1}. ${r.route} - $${r.avgProfit}/job (${r.count} runs)`).join('\n')}` : 'No route history yet - get out there and haul some freight!'}

${topCargo.length > 0 ? `BEST-PAYING CARGO:
${topCargo.map((c, i) => `${i + 1}. ${c.cargo} - $${c.avgProfit}/job (${c.count} loads)`).join('\n')}` : ''}

INSTRUCTIONS:
- Base recommendations on their actual numbers
- When suggesting routes, cite specific profits from their history
- Keep responses under 150 words
- Use trucker lingo but stay professional and helpful
- Always end with a CB sign-off (10-4, catch you on the flip-side, keep the hammer down, etc.)

Driver's question: ${message}`;

    // Call Claude API
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const completion = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: context,
        },
      ],
    });

    const response = completion.content[0].type === 'text' ? completion.content[0].text : 'Sorry, I could not generate a response.';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    );
  }
}
