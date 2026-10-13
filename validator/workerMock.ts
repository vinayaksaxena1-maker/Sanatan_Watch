/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { workerState } from './setupGlobals';
import './astroWorkerMockLoader';

export default class AstroWorkerMock {
  public onmessage: ((event: any) => void) | null = null;

  constructor() {
    workerState.onWorkerReply = (data: any) => {
      if (this.onmessage) {
        this.onmessage({ data });
      }
    };
  }

  postMessage(data: any, transfer?: any) {
    const handler = (global as any).self.onmessage;
    if (handler) {
      if (workerState.isAsyncMode) {
        // Deep copy without breaking ArrayBuffers
        const msgCopy = { ...data };
        setTimeout(() => {
          handler({ data: msgCopy } as any);
        }, 0);
      } else {
        handler({ data } as any);
      }
    }
  }

  terminate() {
    // No-op for mock worker
  }
}
