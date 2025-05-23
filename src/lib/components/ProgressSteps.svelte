<script lang="ts">
    export let currentStep: number = 1;
    
    const steps = [
      { number: 1, title: 'Upload File', description: 'Select your Excel file' },
      { number: 2, title: 'Preview Data', description: 'Review parsed data' },
      { number: 3, title: 'Configure Webhook', description: 'Set destination URL' },
      { number: 4, title: 'Send Events', description: 'Process and send data' }
    ];
  </script>
  
  <div class="mb-8">
    <nav aria-label="Progress">
      <ol class="flex items-start justify-between space-x-4">
        {#each steps as step, index}
          <li class="flex-1 text-center">
            <div class="flex flex-col items-center">
              <!-- Step circle -->
              <div class="relative mb-2">
                {#if step.number < currentStep}
                  <!-- Completed step -->
                  <div 
                    class="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                    style="background-color: #2563EB;"
                  >
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                {:else if step.number === currentStep}
                  <!-- Current step -->
                  <div 
                    class="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                    style="background-color: #2563EB;"
                  >
                    <span class="text-sm font-bold">{step.number}</span>
                  </div>
                {:else}
                  <!-- Future step -->
                  <div 
                    class="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 font-medium border-2"
                    style="background-color: #F3F4F6; border-color: #D1D5DB;"
                  >
                    <span class="text-sm font-bold">{step.number}</span>
                  </div>
                {/if}
              </div>
              
              <!-- Step text -->
              <div class="text-center">
                <p class="text-sm font-medium text-gray-900 mb-1">{step.title}</p>
                <p class="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
            
            <!-- Connection line -->
            {#if index < steps.length - 1}
              <div class="absolute top-5 left-1/2 w-full h-0.5 transform translate-x-1/2 -translate-y-1/2 hidden sm:block"
                   style="background-color: {step.number < currentStep ? '#2563EB' : '#D1D5DB'}; z-index: -1;">
              </div>
            {/if}
          </li>
        {/each}
      </ol>
    </nav>
  </div>
  
  <style>
    li {
      position: relative;
    }
  </style>