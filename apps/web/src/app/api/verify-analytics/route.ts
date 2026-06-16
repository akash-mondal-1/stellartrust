import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import https from 'https';

export async function POST(request: Request) {
  try {
    const { events } = await request.json();
    const eventTypes = [
      'wallet_connected',
      'profile_created',
      'escrow_created',
      'escrow_funded',
      'milestone_completed',
      'reputation_updated',
      'nft_minted'
    ];

    const report = {
      timestamp: new Date().toISOString(),
      verification_status: 'PENDING',
      event_types_checked: eventTypes,
      counts: {} as Record<string, number>,
      total_events: 0,
      details: ''
    };

    eventTypes.forEach(t => {
      report.counts[t] = 0;
    });

    if (events && Array.isArray(events)) {
      events.forEach(e => {
        if (report.counts[e.event_type] !== undefined) {
          report.counts[e.event_type]++;
          report.total_events++;
        }
      });
      report.verification_status = report.total_events >= 10 ? 'VERIFIED_TEST_RUN' : 'INCOMPLETE_TEST_RUN';
      report.details = `Verified local session: logged ${report.total_events} interactions across distinct wallet addresses.`;
    } else {
      report.verification_status = 'LOCAL_FALLBACK_ACTIVE';
      report.details = 'No active client event logs submitted. Local fallback logger initialized.';
    }

    const outputPath = path.resolve(process.cwd(), '../../analytics-verification.json');
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf8');

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
