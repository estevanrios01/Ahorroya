import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/services/database';

function getDb() {
  return supabaseAdmin || supabase;
}

function computeQuality(summary) {
  const issues = summary.issues || {};
  const totalProducts = Number(summary.totalProducts || 0);
  const totalPrices = Number(summary.totalPrices || 0);
  const missingBrand = Number(issues.missingBrand || 0);
  const missingCategory = Number(issues.missingCategory || 0);
  const anomalousPrices = Number(issues.anomalousPrices || 0);
  const invalidEan = Number(issues.invalidEan || 0);
  const duplicates = Number(issues.duplicates || 0);
  const imageIssues = Number(issues.imageIssues || 0);
  const totalIssues = missingBrand + missingCategory + anomalousPrices + invalidEan + duplicates + imageIssues;
  const completenessBase = Math.max(totalProducts, 1);
  const consistencyBase = Math.max(totalPrices + totalProducts, 1);
  const lastFinishedAt = summary.lastScraping?.finished_at;

  const completeness = Math.max(0, Math.round(100 - ((missingBrand + missingCategory) / completenessBase) * 100));
  const consistency = Math.max(0, Math.round(100 - ((duplicates + invalidEan + anomalousPrices) / consistencyBase) * 100));
  const freshness = lastFinishedAt && Date.now() - new Date(lastFinishedAt).getTime() < 8 * 3600000 ? 100 : 0;
  const reliability = Math.max(0, Math.round(100 - (totalIssues / Math.max(totalProducts + totalPrices, 1)) * 100));

  return {
    completeness,
    consistency,
    reliability,
    freshness,
    overall: Math.round((completeness + consistency + reliability + freshness) / 4),
  };
}

export async function GET() {
  const client = getDb();
  if (!client) {
    return NextResponse.json({ success: false, error: 'Supabase no configurado' }, { status: 503 });
  }

  const { data, error } = await client.rpc('get_quality_report_summary');
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  const summary = data || {};
  return NextResponse.json({
    success: true,
    data: {
      ...summary,
      quality: computeQuality(summary),
      timestamp: new Date().toISOString(),
    },
  });
}
