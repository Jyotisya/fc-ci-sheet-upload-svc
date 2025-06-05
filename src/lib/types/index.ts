export interface ExcelRow {
	Name?: string;
	Phone?: string;
	'Center Name'?: string;
	City?: string;
	Zone?: string;
	'Doctor Name'?: string;
	Department?: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: any; // Allow additional dynamic fields
}

// This represents the transformed data that will be sent in webhooks
export interface TransformedExcelRow {
	name?: string;
	phone?: string;
	center_name?: string;
	city?: string;
	zone?: string;
	doctor_name?: string;
	department?: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: any; // Allow additional dynamic fields
}

export interface WebhookEvent {
	eventId: string;
	transactionId: string;
	timestamp: string;
	eventType: 'IP Feedback' | 'OPD Feedback';
	data: TransformedExcelRow;
	metadata: {
		source: 'excel_upload';
		fileName: string;
		rowNumber: number;
	};
}

export interface ProcessingState {
	isProcessing: boolean;
	progress: number;
	currentStep: string;
	processedRows: number;
	totalRows: number;
	errors: Array<{ row: number; message: string }>;
}

export interface UploadResponse {
	success: boolean;
	processedRows: number;
	errors: Array<{
		row: number;
		message: string;
	}>;
	eventIds: string[];
}
