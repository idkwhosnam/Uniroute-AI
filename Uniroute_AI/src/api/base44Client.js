import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

// Create client only if appId exists, otherwise use mock
export const base44 = appId 
  ? createClient({
      appId,
      token,
      functionsVersion,
      serverUrl: '',
      appBaseUrl
    })
  : {
      auth: {
        me: async () => null,
        logout: () => window.localStorage.clear(),
        redirectToLogin: (url) => window.location.href = url
      }
    };
