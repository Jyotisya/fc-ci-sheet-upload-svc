<script lang="ts">
    import type { ExcelRow } from '../types';
    
    export let data: ExcelRow[] = [];
    export let maxRows: number = 5;
    
    $: previewData = data.slice(0, maxRows);
    $: allHeaders = data.length > 0 ? Object.keys(data[0]) : [];
  </script>
  
  {#if data.length > 0}
    <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Data Preview</h3>
        <p class="text-sm text-gray-500 mt-1">
          Showing {Math.min(maxRows, data.length)} of {data.length} rows
        </p>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              {#each allHeaders as header}
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              {/each}
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each previewData as row, index}
              <tr class="hover:bg-gray-50">
                {#each allHeaders as header}
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row[header] || '—'}
                  </td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      
      {#if data.length > maxRows}
        <div class="px-4 py-3 bg-gray-50 border-t border-gray-200 text-center">
          <p class="text-sm text-gray-500">
            ... and {data.length - maxRows} more rows
          </p>
        </div>
      {/if}
    </div>
  {:else}
    <div class="text-center py-8 text-gray-500">
      No data to preview
    </div>
  {/if}