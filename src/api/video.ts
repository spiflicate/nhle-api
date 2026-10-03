/**
 * ======================================================================
 * NHL video metadata from Brightcove, the NHL's video host.
 * Base URL: https://edge.api.brightcove.com/playback/v1
 * ======================================================================
 * Video ids come from `highlightClip` / `discreteClip` fields in Game
 * Center responses (e.g. `gc.game.landing` goals). The policy key is the
 * public one nhl.com's player sends.
 */

import { createNHLClient } from '#/client/index.ts';
import type { APIResult } from '#/client/types.ts';

const ACCOUNT_ID = '6415718365001';
const POLICY_KEY =
   'BCpkADawqM3l37Vq8trLJ95vVwxubXYZXYglAopEZXQTHTWX3YdalyF9xmkuknxjBgiMYwt8VZ_OZ1jAjYxz_yzuNh_cjC3uOaMspVTD-hZfNUHtNnBnhVD0Gmsih8TBF8QlQFXiCQM3W_u4ydJ1qK2Rx8ZutCUg3PHb7Q';

const brightcoveClient = createNHLClient({
   baseUrl: `https://edge.api.brightcove.com/playback/v1/accounts/${ACCOUNT_ID}`,
   headers: { Accept: `application/json;pk=${POLICY_KEY}` },
});

/** One rendition of a video */
export interface VideoSource {
   src: string;
   /** MIME type of a streaming manifest, e.g. application/x-mpegURL */
   type?: string;
   /** Container of a progressive download, e.g. MP4 */
   container?: string;
   codec?: string;
   width?: number;
   height?: number;
}

/** Metadata and playable sources for a video */
export interface VideoMetadata {
   id: string;
   title: string;
   description: string | null;
   longDescription: string | null;
   /** Length in milliseconds */
   duration: number;
   publishedAt: string;
   poster: string | null;
   thumbnail: string | null;
   /** The widest HTTPS MP4 rendition, or null when there is none */
   url: string | null;
   sources: VideoSource[];
   tags: string[];
}

/** Playback API response, reduced to the fields mapped above */
interface BrightcoveVideo {
   id: string;
   name: string;
   description: string | null;
   long_description: string | null;
   duration: number;
   published_at: string;
   poster: string | null;
   thumbnail: string | null;
   sources: VideoSource[];
   tags: string[];
}

/**
 * Get a video's title, descriptions and playable sources
 *
 * @param videoId - Brightcove video id, e.g. a goal's `highlightClip`
 * @returns Promise resolving to the video metadata; an unknown id gives a
 * NotFoundError result
 *
 * @example
 * const result = await video.metadata(6366156642112);
 * if (result.success) console.log(result.data.title, result.data.url);
 */
export async function metadata(
   videoId: string | number,
): Promise<APIResult<VideoMetadata>> {
   const result = await brightcoveClient.get<BrightcoveVideo>(
      `videos/${encodeURIComponent(String(videoId))}`,
   );
   if (!result.success) return result;

   const video = result.data;
   const mp4 = video.sources
      .filter((s) => s.container === 'MP4' && s.src?.startsWith('https:'))
      .sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
   return {
      success: true,
      data: {
         id: video.id,
         title: video.name,
         description: video.description,
         longDescription: video.long_description,
         duration: video.duration,
         publishedAt: video.published_at,
         poster: video.poster,
         thumbnail: video.thumbnail,
         url: mp4[0]?.src ?? null,
         sources: video.sources.map((s) => ({
            src: s.src,
            ...(s.type && { type: s.type }),
            ...(s.container && { container: s.container }),
            ...(s.codec && { codec: s.codec }),
            ...(s.width && { width: s.width }),
            ...(s.height && { height: s.height }),
         })),
         tags: video.tags,
      },
   };
}
