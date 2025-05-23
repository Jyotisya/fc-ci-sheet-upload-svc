<script lang="ts">
    import { Download } from 'lucide-svelte';
    import * as XLSX from 'xlsx';
    
    function generateSampleData() {
      const sampleData = [
        ['Name', 'Phone', 'Center Name', 'City', 'Zone', 'Doctor Name', 'Department'],
        ['John Doe', '+1-555-0123', 'Downtown Medical Center', 'New York', 'Zone A', 'Dr. Smith', 'Cardiology'],
        ['Jane Smith', '+1-555-0124', 'Uptown Health Clinic', 'New York', 'Zone B', 'Dr. Johnson', 'Neurology'],
        ['Mike Wilson', '+1-555-0125', 'Central Hospital', 'Boston', 'Zone A', 'Dr. Brown', 'Orthopedics'],
        ['Sarah Davis', '+1-555-0126', 'East Side Medical', 'Chicago', 'Zone C', 'Dr. Miller', 'Pediatrics'],
        ['Robert Taylor', '+1-555-0127', 'West End Clinic', 'Los Angeles', 'Zone B', 'Dr. Wilson', 'Dermatology']
      ];
      
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(sampleData);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Patient Data');
      
      // Generate buffer
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      
      // Create blob and download
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sample-patient-data.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
    }
  </script>
  
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <div class="flex items-start space-x-3">
      <div class="flex-shrink-0">
        <svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="flex-1">
        <h3 class="text-sm font-medium text-blue-800">Need sample data?</h3>
        <p class="text-sm text-blue-700 mt-1">
          Download a sample Excel file with the correct format to test the upload functionality.
        </p>
        <button
          type="button"
          on:click={generateSampleData}
          class="mt-3 inline-flex items-center space-x-2 text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors"
        >
          <Download class="w-4 h-4" />
          <span>Download Sample File</span>
        </button>
      </div>
    </div>
  </div>