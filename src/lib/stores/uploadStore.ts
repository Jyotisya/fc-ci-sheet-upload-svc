import { writable } from 'svelte/store';
import type { ProcessingState, ExcelRow } from '../types';

export const uploadState = writable<ProcessingState>({
	isProcessing: false,
	progress: 0,
	currentStep: '',
	processedRows: 0,
	totalRows: 0,
	errors: []
});

export const parsedData = writable<ExcelRow[]>([]);
export const selectedFile = writable<File | null>(null);
