import { afterEach, describe, expect, it } from 'bun:test';
import { metadata } from '#/api/video.ts';
import { config } from '#/config/index.ts';
import { NotFoundError } from '#/errors/index.ts';

describe('video.metadata', () => {
   const originalFetch = globalThis.fetch;

   afterEach(() => {
      globalThis.fetch = originalFetch;
      config.logLevel = 'warn';
   });

   function respond(body: unknown, status = 200) {
      const calls: { url: string; init: RequestInit }[] = [];
      globalThis.fetch = (async (url: string, init: RequestInit) => {
         calls.push({ url, init });
         return new Response(JSON.stringify(body), { status });
      }) as unknown as typeof fetch;
      return calls;
   }

   it('maps the playback response and picks the widest HTTPS MP4', async () => {
      const calls = respond({
         id: '42',
         name: 'Goal',
         description: 'Short',
         long_description: 'Long',
         duration: 41378,
         published_at: '2024-12-18T00:51:54.053Z',
         poster: 'https://p',
         thumbnail: 'https://t',
         tags: ['goal'],
         sources: [
            { src: 'https://hls', type: 'application/x-mpegURL' },
            { src: 'http://mp4-1280', container: 'MP4', width: 1280 },
            { src: 'https://mp4-640', container: 'MP4', width: 640 },
            { src: 'https://mp4-1280', container: 'MP4', width: 1280 },
         ],
      });

      const result = await metadata(42);

      expect(calls[0]?.url).toEndWith('/accounts/6415718365001/videos/42');
      const headers = calls[0]?.init.headers as Record<string, string>;
      expect(headers.Accept).toStartWith('application/json;pk=');
      expect(result.success).toBeTrue();
      if (!result.success) return;
      expect(result.data.title).toBe('Goal');
      expect(result.data.longDescription).toBe('Long');
      expect(result.data.url).toBe('https://mp4-1280');
      expect(result.data.sources).toHaveLength(4);
   });

   it('returns a NotFoundError for an unknown video', async () => {
      config.logLevel = 'silent';
      respond([{ error_code: 'VIDEO_NOT_FOUND' }], 404);

      const result = await metadata(1);

      expect(result.success).toBeFalse();
      if (!result.success)
         expect(result.error).toBeInstanceOf(NotFoundError);
   });
});
