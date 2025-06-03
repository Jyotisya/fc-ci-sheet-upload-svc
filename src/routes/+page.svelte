<script lang="ts">
    import { uploadState, selectedFile, parsedData } from '$lib/stores/uploadStore';
    import Header from '$lib/components/Header.svelte';
    import ProgressSteps from '$lib/components/ProgressSteps.svelte';
    import FileUpload from '$lib/components/FileUpload.svelte';
    import DataPreview from '$lib/components/DataPreview.svelte';
    import WebhookConfig from '$lib/components/WebhookConfig.svelte';
    import SampleDataGenerator from '$lib/components/SampleDataGenerator.svelte';
    import { ExcelParser } from '$lib/utils/excelParser';
    import { WebhookTransformer } from '$lib/utils/webhookTransformer';
	  import HospitalList from '$lib/components/HospitalList.svelte';
    
    let isProcessing = false;
    let errorMessage = '';
    let successMessage = '';
    let webhookResults: { success: boolean; errors: Array<{ eventId: string; error: string }> } | null = null;
    
    // Determine current step based on state
    $: currentStep = (() => {
      if (webhookResults || successMessage) return 4;
      if ($parsedData.length > 0 && !isProcessing) return 3;
      if ($selectedFile && $parsedData.length > 0) return 2;
      return 1;
    })();
    
    async function handleFileSelected(event: CustomEvent<File>) {
      const file = event.detail;
      selectedFile.set(file);
      errorMessage = '';
      successMessage = '';
      webhookResults = null;
      
      // Parse the file
      isProcessing = true;
      uploadState.update(state => ({
        ...state,
        isProcessing: true,
        currentStep: 'Parsing Excel file...',
        progress: 25
      }));
      
      try {
        const data = await ExcelParser.parseFile(file);
        
        uploadState.update(state => ({
          ...state,
          currentStep: 'Validating data...',
          progress: 75
        }));
        
        // Validate the data
        const validation = ExcelParser.validateRequiredFields(data);
        
        if (!validation.valid) {
          errorMessage = 'Validation errors found:\n' + validation.errors.join('\n');
          uploadState.update(state => ({
            ...state,
            isProcessing: false,
            progress: 0,
            errors: validation.errors.map((error, index) => ({ row: index, message: error }))
          }));
          return;
        }
        
        // Success
        parsedData.set(data);
        uploadState.update(state => ({
          ...state,
          isProcessing: false,
          currentStep: 'Ready to process',
          progress: 100,
          totalRows: data.length,
          processedRows: 0,
          errors: []
        }));
        
      } catch (error) {
        errorMessage = error instanceof Error ? error.message : 'Failed to parse file';
        uploadState.update(state => ({
          ...state,
          isProcessing: false,
          progress: 0,
          currentStep: '',
          errors: [{ row: 0, message: errorMessage }]
        }));
      } finally {
        isProcessing = false;
      }
    }
    
    function handleFileRemoved() {
      selectedFile.set(null);
      parsedData.set([]);
      errorMessage = '';
      successMessage = '';
      webhookResults = null;
      uploadState.update(state => ({
        ...state,
        isProcessing: false,
        progress: 0,
        currentStep: '',
        processedRows: 0,
        totalRows: 0,
        errors: []
      }));
    }
    
    async function handleSendWebhooks(event: CustomEvent<{ targetUrl: string; batchSize: number }>) {
      const { targetUrl, batchSize } = event.detail;
      
      if ($parsedData.length === 0 || !$selectedFile) return;
      
      isProcessing = true;
      errorMessage = '';
      successMessage = '';
      
      uploadState.update(state => ({
        ...state,
        isProcessing: true,
        currentStep: 'Transforming data to webhook events...',
        progress: 10
      }));
      
      try {
        // Transform data to webhook events
        const webhookEvents = WebhookTransformer.transformToWebhookEvents(
          $parsedData, 
          $selectedFile.name
        );
        
        uploadState.update(state => ({
          ...state,
          currentStep: 'Sending webhook events...',
          progress: 25
        }));
        
        // Send webhook events
        const results = await WebhookTransformer.sendWebhookEvents(
          webhookEvents,
          targetUrl,
          batchSize,
          (processed, total) => {
            const progress = 25 + (processed / total) * 70; // 25% to 95%
            uploadState.update(state => ({
              ...state,
              progress,
              processedRows: processed,
              currentStep: `Sent ${processed} of ${total} webhook events...`
            }));
          }
        );
        
        webhookResults = results;
        
        if (results.success) {
          successMessage = `Successfully sent ${webhookEvents.length} webhook events!`;
        } else {
          successMessage = `Sent ${webhookEvents.length - results.errors.length} of ${webhookEvents.length} webhook events. ${results.errors.length} failed.`;
        }
        
        uploadState.update(state => ({
          ...state,
          isProcessing: false,
          currentStep: 'Complete',
          progress: 100,
          processedRows: webhookEvents.length - results.errors.length,
          errors: results.errors.map((error, index) => ({ row: index, message: error.error }))
        }));
        
      } catch (error) {
        errorMessage = error instanceof Error ? error.message : 'Failed to send webhooks';
        uploadState.update(state => ({
          ...state,
          isProcessing: false,
          progress: 0,
          currentStep: '',
          errors: [{ row: 0, message: errorMessage }]
        }));
      } finally {
        isProcessing = false;
      }
    }
    
    function resetProcess() {
      handleFileRemoved();
    }
  </script>
  
  <div class="min-h-screen bg-gray-50">
    <Header />
    
    <div class="max-w-4xl mx-auto py-8 px-4">
      <ProgressSteps {currentStep} />
      
      <div class="space-y-6">
        <!-- Upload Section -->
        <div class="bg-white rounded-lg shadow-sm p-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900">
              Upload Excel File
            </h2>
            {#if successMessage}
              <button
                on:click={resetProcess}
                class="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Start Over
              </button>
            {/if}
          </div>
          
          {#if !$selectedFile}
            <div  class="space-y-4 mb-6">
              <SampleDataGenerator />
              <HospitalList />
            </div>
          {/if}
          
          <FileUpload 
            on:fileSelected={handleFileSelected}
            on:fileRemoved={handleFileRemoved}
          />
          
          <!-- Processing State -->
          {#if isProcessing}
            <div class="mt-6 p-4 bg-blue-50 rounded-lg">
              <div class="flex items-center space-x-3">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span class="text-blue-800">{$uploadState.currentStep}</span>
              </div>
              <div class="mt-2 w-full bg-blue-200 rounded-full h-2">
                <div 
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style="width: {$uploadState.progress}%"
                ></div>
              </div>
              {#if $uploadState.processedRows > 0}
                <p class="text-sm text-blue-600 mt-2">
                  Processed: {$uploadState.processedRows} / {$uploadState.totalRows}
                </p>
              {/if}
            </div>
          {/if}
          
          <!-- Error Message -->
          {#if errorMessage}
            <div class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 class="text-red-800 font-medium mb-2">Error Processing File</h4>
              <pre class="text-sm text-red-600 whitespace-pre-wrap">{errorMessage}</pre>
            </div>
          {/if}
          
          <!-- Success Message -->
          {#if successMessage}
            <div class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 class="text-green-800 font-medium mb-2">Success!</h4>
              <p class="text-sm text-green-600">{successMessage}</p>
            </div>
          {/if}
          
          <!-- File Ready State -->
          {#if $selectedFile && $parsedData.length > 0 && !isProcessing && !successMessage}
            <div class="mt-6 p-4 bg-green-50 rounded-lg">
              <p class="text-green-800">
                ✓ Successfully parsed <strong>{$parsedData.length} rows</strong> from {$selectedFile.name}
              </p>
            </div>
          {/if}
        </div>
        
        <!-- Data Preview Section -->
        {#if $parsedData.length > 0}
          <div class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">
              Data Preview
            </h2>
            <DataPreview data={$parsedData} />
          </div>
        {/if}
        
        <!-- Webhook Configuration Section -->
        {#if $parsedData.length > 0 && !successMessage}
        <div class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">
            Send Webhook Events
            </h2>

            <WebhookConfig 
            {isProcessing}
            totalRows={$parsedData.length}
            on:sendWebhooks={handleSendWebhooks}
            />
        </div>
        {/if}
        <!-- Results Section -->
        {#if webhookResults}
          <div class="bg-white rounded-lg shadow-sm p-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">
              Results
            </h2>
            
            <div class="space-y-4">
              {#if webhookResults.success}
                <div class="p-4 bg-green-50 rounded-lg">
                  <h3 class="text-green-800 font-medium">All Events Sent Successfully! 🎉</h3>
                  <p class="text-green-600 text-sm mt-1">
                    {$uploadState.totalRows} webhook events were delivered to the target endpoint.
                  </p>
                </div>
              {:else}
                <div class="p-4 bg-yellow-50 rounded-lg">
                  <h3 class="text-yellow-800 font-medium">Partial Success</h3>
                  <p class="text-yellow-600 text-sm mt-1">
                    {$uploadState.processedRows} events sent successfully, {webhookResults.errors.length} failed.
                  </p>
                </div>
                
                {#if webhookResults.errors.length > 0}
                  <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 class="text-red-800 font-medium mb-2">Failed Events:</h4>
                    <div class="text-sm text-red-600 space-y-1 max-h-40 overflow-y-auto">
                      {#each webhookResults.errors.slice(0, 10) as error}
                        <div>Event ID: {error.eventId} - {error.error}</div>
                      {/each}
                      {#if webhookResults.errors.length > 10}
                        <div class="text-red-500">... and {webhookResults.errors.length - 10} more errors</div>
                      {/if}
                    </div>
                  </div>
                {/if}
              {/if}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>