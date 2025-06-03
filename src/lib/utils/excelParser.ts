import * as XLSX from 'xlsx';
import type { ExcelRow } from '../types';
import { isValidHospital, getSimilarHospitals } from '$lib/config/hospitals';

export class ExcelParser {
	static async parseFile(file: File): Promise<ExcelRow[]> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = (e) => {
				try {
					const data = new Uint8Array(e.target?.result as ArrayBuffer);
					const workbook = XLSX.read(data, { type: 'array' });

					// Get the first worksheet
					const worksheetName = workbook.SheetNames[0];
					if (!worksheetName) {
						throw new Error('No worksheets found in the Excel file');
					}

					const worksheet = workbook.Sheets[worksheetName];

					// Convert to JSON
					const jsonData = XLSX.utils.sheet_to_json(worksheet, {
						header: 1,
						defval: ''
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
					}) as any[][];

					if (jsonData.length < 2) {
						throw new Error('Excel file must contain headers and at least one data row');
					}

					// Extract headers and data
					const headers = jsonData[0] as string[];
					const rows = jsonData.slice(1);

					// Transform to objects
					const parsedRows: ExcelRow[] = rows
						.filter((row) => row.some((cell) => cell !== '')) // Skip empty rows
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
						.map((row, index) => {
							const rowObj: ExcelRow = {};
							headers.forEach((header, colIndex) => {
								if (header && header.trim()) {
									const value = row[colIndex];
									rowObj[header.trim()] = value !== undefined ? String(value).trim() : '';
								}
							});
							return rowObj;
						});

					if (parsedRows.length === 0) {
						throw new Error('No valid data rows found in the Excel file');
					}

					resolve(parsedRows);
				} catch (error) {
					reject(
						new Error(
							`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`
						)
					);
				}
			};

			reader.onerror = () => {
				reject(new Error('Failed to read the file'));
			};

			reader.readAsArrayBuffer(file);
		});
	}

	static validateRequiredFields(data: ExcelRow[]): { valid: boolean; errors: string[] } {
		const errors: string[] = [];
		const requiredFields = ['Name', 'Phone'];

		data.forEach((row, index) => {
			requiredFields.forEach((field) => {
				if (!row[field] || row[field].trim() === '') {
					errors.push(`Row ${index + 2}: Missing required field "${field}"`);
				}
			});

			// Validate phone number format (basic validation)
			// eslint-disable-next-line no-useless-escape
			if (row.Phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(row.Phone)) {
				errors.push(`Row ${index + 2}: Invalid phone number format`);
			}

			if (row['Center Name']) {
				const centerName = row['Center Name'].trim();
				if (!isValidHospital(centerName)) {
					const suggestions = getSimilarHospitals(centerName);
					let errorMsg = `Row ${index}: Invalid Center Name "${centerName}". Must exactly match one of the approved hospitals.`;

					if (suggestions.length > 0) {
						errorMsg += ` Did you mean: ${suggestions.join(', ')}?`;
					}

					errors.push(errorMsg);
				}
			}
		});

		return {
			valid: errors.length === 0,
			errors
		};
	}
}
