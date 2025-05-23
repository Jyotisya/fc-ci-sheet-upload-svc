/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as uuidv4 } from 'uuid';
import type { ExcelRow, WebhookEvent } from '../types';

export class WebhookTransformer {
	static transformToWebhookEvents(data: ExcelRow[], fileName: string): WebhookEvent[] {
		return data.map((row, index) => {
			const eventId = uuidv4();
			const transactionId = uuidv4();
			const timestamp = new Date().toISOString();

			// Transform the data to snake_case
			const transformedData = this.transformToSnakeCase(row);

			return {
				eventId,
				transactionId,
				timestamp,
				eventType: 'patient_data_upload',
				data: transformedData,
				metadata: {
					source: 'excel_upload',
					fileName,
					rowNumber: index + 2
				}
			};
		});
	}

	static transformToSnakeCase(data: ExcelRow): Record<string, any> {
		console.log('Input data to transform:', data);

		const transformed: Record<string, any> = {};

		for (const [key, value] of Object.entries(data)) {
			// Skip if value is empty
			if (value === undefined || value === null || value === '') {
				continue;
			}

			// Convert key to snake_case
			const snakeKey = key
				.trim()
				.toLowerCase()
				.replace(/\s+/g, '_')
				.replace(/[^a-z0-9_]/g, '')
				.replace(/_+/g, '_')
				.replace(/^_|_$/g, '');

			console.log(`Transforming "${key}" -> "${snakeKey}" = "${value}"`);

			if (snakeKey) {
				transformed[snakeKey] = String(value).trim();
			}
		}

		console.log('Transformed result:', transformed);
		return transformed;
	}

	// Updated to use server-side endpoint
	static async sendWebhookEvents(
		events: WebhookEvent[],
		targetUrl: string,
		batchSize: number = 10,
		onProgress?: (processed: number, total: number) => void
	): Promise<{ success: boolean; errors: Array<{ eventId: string; error: string }> }> {
		try {
			// Send to our server API endpoint instead of directly to target
			const response = await fetch('/api', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					events,
					targetUrl,
					batchSize
				})
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
				throw new Error(errorData.error || `HTTP ${response.status}`);
			}

			const result = await response.json();

			// Simulate progress for UI (since server processes in one go)
			if (onProgress) {
				onProgress(result.processedCount, result.totalEvents);
			}

			return {
				success: result.success,
				errors: result.errors || []
			};
		} catch (error) {
			console.error('Webhook sending failed:', error);
			return {
				success: false,
				errors: [
					{
						eventId: 'unknown',
						error: error instanceof Error ? error.message : 'Failed to send webhooks'
					}
				]
			};
		}
	}

	static validateWebhookUrl(url: string): boolean {
		try {
			const parsedUrl = new URL(url);
			return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
		} catch {
			return false;
		}
	}
}
