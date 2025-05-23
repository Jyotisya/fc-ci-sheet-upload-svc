<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { Upload, File as FileIcon, X } from 'lucide-svelte';
    
    const dispatch = createEventDispatcher<{
      fileSelected: File;
      fileRemoved: void;
    }>();
    
    let dragActive = false;
    let fileInput: HTMLInputElement;
    let selectedFile: File | null = null;
    
    function handleDragEnter(e: DragEvent) {
      e.preventDefault();
      dragActive = true;
    }
    
    function handleDragLeave(e: DragEvent) {
      e.preventDefault();
      dragActive = false;
    }
    
    function handleDragOver(e: DragEvent) {
      e.preventDefault();
    }
    
    function handleDrop(e: DragEvent) {
      e.preventDefault();
      dragActive = false;
      
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        handleFileSelection(files[0]);
      }
    }
    
    function handleFileInput(e: Event) {
      const target = e.target as HTMLInputElement;
      const files = target.files;
      if (files && files.length > 0) {
        handleFileSelection(files[0]);
      }
    }
    
    function handleFileSelection(file: File) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel' // .xls
      ];
      
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid Excel file (.xlsx or .xls)');
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      selectedFile = file;
      dispatch('fileSelected', file);
    }
    
    function removeFile() {
      selectedFile = null;
      if (fileInput) {
        fileInput.value = '';
      }
      dispatch('fileRemoved');
    }
    
    function openFileDialog() {
      fileInput.click();
    }
  </script>
  
  <div class="w-full">
    <!-- File Input (hidden) -->
    <input
      bind:this={fileInput}
      type="file"
      accept=".xlsx,.xls"
      on:change={handleFileInput}
      class="hidden"
    />
    
    {#if !selectedFile}
      <!-- Upload Area -->
      <div
        class="border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer
               {dragActive 
                 ? 'border-primary-500 bg-primary-50' 
                 : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
               }"
        on:dragenter={handleDragEnter}
        on:dragleave={handleDragLeave}
        on:dragover={handleDragOver}
        on:drop={handleDrop}
        on:click={openFileDialog}
        role="button"
        tabindex="0"
        on:keydown={(e) => e.key === 'Enter' && openFileDialog()}
      >
        <div class="flex flex-col items-center space-y-4">
          <div class="p-3 bg-primary-100 rounded-full">
            <Upload class="w-8 h-8 text-primary-600" />
          </div>
          
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              Drop your Excel file here
            </h3>
            <p class="text-gray-500 mb-4">
              or click to browse your files
            </p>
            
            <div class="text-sm text-gray-400">
              Supports .xlsx and .xls files up to 10MB
            </div>
          </div>
        </div>
      </div>
    {:else}
      <!-- Selected File Display -->
      <div class="border border-gray-200 rounded-lg p-4 bg-white animate-fade-in">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-green-100 rounded">
              <FileIcon class="w-5 h-5 text-green-600" />
            </div>
            
            <div>
              <div class="font-medium text-gray-900">
                {selectedFile.name}
              </div>
              <div class="text-sm text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          </div>
          
          <button
            on:click={removeFile}
            class="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Remove file"
          >
            <X class="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      </div>
    {/if}
  </div>