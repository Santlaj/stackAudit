import { graphifyService } from './src/modules/analysis/graphify.service.js';
import { repositoryFetcherService } from './src/modules/analysis/repository-fetcher.service.js';

async function run() {
  process.env.GRAPHIFY_TIMEOUT_MS = '5000'; // 5 seconds
  
  // Create a fake repo dir
  const owner = 'yakew7';
  const repo = 'Fair-Code';
  let tempDir;
  
  try {
    tempDir = await repositoryFetcherService.fetchRepository(owner, repo);
    console.log(`Temp dir: ${tempDir}`);
    
    console.log('Starting graphify build with 5s timeout...');
    await graphifyService.buildGraph(tempDir);
    console.log('Graphify build finished (or fell back)');
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    if (tempDir) {
      console.log('Starting cleanup...');
      await repositoryFetcherService.cleanup(tempDir);
      console.log('Cleanup finished.');
    }
  }
}

run();
