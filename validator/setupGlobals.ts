/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Global mock state to bridge the worker instance and the worker file execution
export const workerState = {
  isAsyncMode: false,
  onWorkerReply: null as ((data: any) => void) | null,
  workerMessageHandler: null as ((event: any) => void) | null
};

// Set up browser-like global self object before importing astroWorker
const mockSelf = {
  postMessage: (data: any) => {
    if (workerState.isAsyncMode) {
      setTimeout(() => {
        if (workerState.onWorkerReply) {
          workerState.onWorkerReply(data);
        }
      }, 0);
    } else {
      if (workerState.onWorkerReply) {
        workerState.onWorkerReply(data);
      }
    }
  },
  onmessage: null as ((event: any) => void) | null
};

// Expose on global object for the worker logic to bind to
(global as any).self = mockSelf;
(global as any).postMessage = mockSelf.postMessage;
(global as any).window = global;

const mockLocation = {
  href: 'file:///c:/Users/user/Desktop/Samay%20Ghadi/validator/validateEngineV2.js',
  pathname: '/c:/Users/user/Desktop/Samay%20Ghadi/validator/validateEngineV2.js',
  search: ''
};

const mockDocument = {
  currentScript: {
    src: 'file:///c:/Users/user/Desktop/Samay%20Ghadi/validator/validateEngineV2.js'
  }
};

(global as any).location = mockLocation;
(global as any).document = mockDocument;


