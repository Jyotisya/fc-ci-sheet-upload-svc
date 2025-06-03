// List of valid hospital/center names (exact match required)
export const VALID_HOSPITALS = [
	'Chandigarh Sec 44',
	'Chandigarh Zirakpur',
	'Motherhood Hospital - Noida',
	'Motherhood Hospital - Hebbal',
	'Motherhood Hospital - Indore',
	'Motherhood Hospital - Mohali',
	'Motherhood Hospital - Mysore',
	'Motherhood Hospital - Chennai',
	'Motherhood Hospital - Kharadi',
	'Motherhood Hospital - Khargar',
	'Motherhood Hospital - Kolkata',
	'Motherhood Hospital - Kothnur',
	'CHANDIGARH IVF CLINIC - Sec 43',
	'Motherhood Hospital - Gurugram',
	'Motherhood Hospital - Sarjapur',
	'Motherhood Hospital - Lullanagar',
	'Motherhood Hospital - Whitefield',
	'Motherhood Hospital - HRBR Layout',
	'Motherhood Hospital - Indiranagar',
	'Motherhood Hospital - Banashankari',
	'Motherhood Hospital - Electronic City',
	'Motherhood Hospital - Noida Extension',
	"Women's Centre by Motherhood Hospital - Coimbatore"
] as const;

export type ValidHospital = (typeof VALID_HOSPITALS)[number];

// Helper function to check if a hospital name is valid
export function isValidHospital(hospitalName: string): boolean {
	return VALID_HOSPITALS.includes(hospitalName as ValidHospital);
}

// Helper function to get suggestions for similar hospital names
export function getSimilarHospitals(input: string): string[] {
	const inputLower = input.toLowerCase();
	return VALID_HOSPITALS.filter(
		(hospital) =>
			hospital.toLowerCase().includes(inputLower) || inputLower.includes(hospital.toLowerCase())
	).slice(0, 3); // Return top 3 matches
}
