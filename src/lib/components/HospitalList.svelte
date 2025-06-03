<script lang="ts">
    import { VALID_HOSPITALS } from '../config/hospitals';
    import { Info, Download } from 'lucide-svelte';
    
    let showFullList = false;
  </script>
  
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <div class="flex items-start space-x-3">
      <div class="flex-shrink-0">
        <Info class="w-5 h-5 text-blue-400 mt-0.5" />
      </div>
      <div class="flex-1">
        <h3 class="text-sm font-medium text-blue-800 mb-2">Hospital Name Validation</h3>
        <p class="text-sm text-blue-700 mb-3">
          The "Center Name" column must exactly match one of our approved hospitals. 
          Names are case-sensitive and must be spelled exactly as shown below.
        </p>
        
        <button
          type="button"
          on:click={() => showFullList = !showFullList}
          class="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors mb-3"
        >
          {showFullList ? 'Hide' : 'Show'} Valid Hospital Names ({VALID_HOSPITALS.length})
        </button>
        
        {#if showFullList}
          <div class="bg-white border border-blue-200 rounded p-3 max-h-60 overflow-y-auto">
            <div class="grid grid-cols-1 gap-1">
              {#each VALID_HOSPITALS as hospital}
                <div class="text-sm text-gray-700 font-mono bg-gray-50 px-2 py-1 rounded">
                  {hospital}
                </div>
              {/each}
            </div>
          </div>
          
          <div class="mt-3 text-xs text-blue-600">
            💡 Tip: Copy the exact spelling from this list to avoid validation errors
          </div>
        {/if}
      </div>
    </div>
  </div>