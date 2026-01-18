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

    // Build context for AI
    const context = `You are Roadie, an AI dispatcher assistant for a virtual trucking company in American Truck Simulator.

USER STATS:
- Total Jobs Completed: ${totalJobs}
- Total Income: $${totalIncome.toLocaleString()}
- Total Profit: $${totalProfit.toLocaleString()}
- Average Profit per Job: $${Math.round(avgProfit).toLocaleString()}

${topRoutes.length > 0 ? `TOP PROFITABLE ROUTES:
${topRoutes.map((r, i) => `${i + 1}. ${r.route}: $${r.avgProfit} avg profit (${r.count} jobs)`).join('\n')}` : 'No route data available yet.'}

Your job is to:
1. Provide actionable advice based on their actual performance data
2. Be friendly, encouraging, and use trucking terminology
3. Keep responses concise (under 200 words)
4. Use specific numbers from their stats when relevant
5. Give practical tips for improving profits and efficiency

User's question: ${message}`;

    // Call Claude API
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const completion = await anthropic.messages.create({
      model: 'claude-sonnet-3-5-20241022',
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
