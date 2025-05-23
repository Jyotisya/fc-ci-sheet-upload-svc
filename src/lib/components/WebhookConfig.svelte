<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { Send, Settings, Info } from 'lucide-svelte';
    import { WebhookTransformer } from '../utils/webhookTransformer';
    
    const dispatch = createEventDispatcher<{
      sendWebhooks: { targetUrl: string; batchSize: number };
    }>();
    
    export let isProcessing = false;
    export let totalRows = 0;
    
    let targetUrl = 'https://test-api.freecustomer.in/api/v1/webhook/incoming/general/a4ddccb0-b5f7-48b0-9a27-ab513c8ad059';
    let batchSize = 10;
    let showAdvanced = false;
    let urlError = '';
    
    function validateUrl() {
      if (!targetUrl.trim()) {
        urlError = 'Webhook URL is required';
        return false;
      }
      
      if (!WebhookTransformer.validateWebhookUrl(targetUrl)) {
        urlError = 'Please enter a valid HTTP or HTTPS URL';
        return false;
      }
      
      urlError = '';
      return true;
    }
    
    function handleSubmit() {
      console.log('Submit clicked', { targetUrl, batchSize, totalRows, isProcessing });
      if (validateUrl()) {
        dispatch('sendWebhooks', { targetUrl, batchSize });
      }
    }
    
    $: isUrlValid = !urlError && targetUrl.trim().length > 0;
    $: buttonDisabled = isProcessing || !isUrlValid || totalRows === 0;
  </script>
  
  <div class="bg-white border border-gray-200 rounded-lg p-6">
    <div class="flex items-center space-x-3 mb-6">
      <div class="p-2 bg-blue-100 rounded">
        <Send class="w-5 h-5 text-blue-600" />
      </div>
      <h3 class="text-lg font-medium text-gray-900">
        Webhook Configuration
      </h3>
    </div>
    
    <!-- Localhost info -->
    <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div class="flex items-start space-x-2">
        <Info class="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div class="text-sm text-blue-800">
          <p class="font-medium mb-1">Testing with localhost?</p>
          <p>This service can now send webhooks to localhost URLs! The requests are sent server-side to avoid CORS issues.</p>
        </div>
      </div>
    </div>
    
    <div class="space-y-4">
      <!-- Target URL -->
      <div>
        <label for="targetUrl" class="block text-sm font-medium text-gray-700 mb-1">
          Webhook URL
        </label>
        <input
          id="targetUrl"
          type="url"
          bind:value={targetUrl}
          on:blur={validateUrl}
          placeholder="https://your-api.com/webhook"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500
                 {urlError ? 'border-red-300' : ''}"
          disabled={isProcessing}
        />
        {#if urlError}
          <p class="mt-1 text-sm text-red-600">{urlError}</p>
        {/if}
        <p class="mt-1 text-sm text-gray-500">
          The endpoint where webhook events will be sent (localhost URLs supported)
        </p>
      </div>
      
      <!-- Advanced Settings Toggle -->
      <button
        type="button"
        on:click={() => showAdvanced = !showAdvanced}
        class="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
        disabled={isProcessing}
      >
        <Settings class="w-4 h-4" />
        <span>Advanced Settings</span>
        <span class="text-xs">
          {showAdvanced ? '▼' : '▶'}
        </span>
      </button>
      
      <!-- Advanced Settings -->
      {#if showAdvanced}
        <div class="pl-6 border-l-2 border-gray-100 space-y-4">
          <div>
            <label for="batchSize" class="block text-sm font-medium text-gray-700 mb-1">
              Batch Size
            </label>
            <input
              id="batchSize"
              type="number"
              bind:value={batchSize}
              min="1"
              max="100"
              class="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              disabled={isProcessing}
            />
            <p class="mt-1 text-sm text-gray-500">
              Number of events to send simultaneously (1-100)
            </p>
          </div>
        </div>
      {/if}
      
      <!-- Summary -->
      <div class="bg-gray-50 rounded-lg p-4">
        <h4 class="text-sm font-medium text-gray-900 mb-2">Ready to Send</h4>
        <div class="text-sm text-gray-600 space-y-1">
          <p>• {totalRows} webhook events will be generated</p>
          <p>• Events will be sent in batches of {batchSize}</p>
          <p>• Each event will have a unique ID and timestamp</p>
          <p>• Data will be formatted in snake_case</p>
        </div>
      </div>
      
      <!-- Send Button -->
      <div class="pt-4 border-t border-gray-200">
        <button
          type="button"
          on:click={handleSubmit}
          disabled={buttonDisabled}
          class="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors text-base font-medium border-0"
          style="background-color: {buttonDisabled ? '#9CA3AF' : '#2563EB'}; color: white; cursor: {buttonDisabled ? 'not-allowed' : 'pointer'};"
        >
          {#if isProcessing}
            <div style="
              width: 16px;
              height: 16px;
              border: 2px solid transparent;
              border-top: 2px solid white;
              border-radius: 50%;
              animation: spin 1s linear infinite;
            "></div>
            <span>Sending Webhooks...</span>
          {:else}
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
            <span>Send {totalRows} Webhook Events</span>
          {/if}
        </button>
      </div>
    </div>
  </div>
  
  <style>
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  </style>