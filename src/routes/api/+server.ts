/* eslint-disable @typescript-eslint/no-explicit-any */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { events, targetUrl, batchSize = 10 } = await request.json();

		console.log('Webhook API called with:', {
			targetUrl,
			eventCount: events?.length,
			batchSize
		});

		if (!events || !Array.isArray(events)) {
			return json({ error: 'Invalid events data' }, { status: 400 });
		}

		if (!targetUrl) {
			return json({ error: 'Target URL is required' }, { status: 400 });
		}

		const errors: Array<{ eventId: string; error: string }> = [];
		let processedCount = 0;
		const totalEvents = events.length;

		console.log(`Starting to send ${totalEvents} events to ${targetUrl}`);

		// Process in batches
		for (let i = 0; i < events.length; i += batchSize) {
			const batch = events.slice(i, i + batchSize);

			console.log(
				`Processing batch ${Math.floor(i / batchSize) + 1}, events ${i + 1}-${Math.min(i + batchSize, events.length)}`
			);

			try {
				await Promise.all(
					batch.map(async (event: any, batchIndex: number) => {
						try {
							console.log(`Sending event ${i + batchIndex + 1} to ${targetUrl}`);

							const response = await fetch(targetUrl, {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
									'User-Agent': 'Excel-Webhook-Service/1.0.0'
								},
								body: JSON.stringify(event)
							});

							console.log(
								`Event ${i + batchIndex + 1} response:`,
								response.status,
								response.statusText
							);

							if (!response.ok) {
								const errorText = await response.text().catch(() => 'Unknown error');
								throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
							}

							processedCount++;
						} catch (error) {
							console.error(`Error sending event ${i + batchIndex + 1}:`, error);
							errors.push({
								eventId: event.eventId,
								error: error instanceof Error ? error.message : 'Unknown error'
							});
						}
					})
				);

				// Small delay between batches
				if (i + batchSize < events.length) {
					await new Promise((resolve) => setTimeout(resolve, 100));
				}
			} catch (batchError) {
				console.error('Batch error:', batchError);
				batch.forEach((event: any) => {
					errors.push({
						eventId: event.eventId,
						error: batchError instanceof Error ? batchError.message : 'Batch processing failed'
					});
				});
			}
		}

		console.log(
			`Finished sending webhooks. Success: ${processedCount}/${totalEvents}, Errors: ${errors.length}`
		);

		return json({
			success: errors.length === 0,
			processedCount,
			totalEvents,
			errors,
			targetUrl: targetUrl // Include this for debugging
		});
	} catch (error) {
		console.error('Webhook API error:', error);
		return json(
			{ error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown') },
			{ status: 500 }
		);
	}
};
