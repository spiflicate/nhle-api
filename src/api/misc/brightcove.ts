/**
 * Represents the metadata structure for a video response
 * @interface VideoMetadata
 */
interface VideoMetadata {
   /** The URL of the video source, null if unavailable */
   url: string | null;
   /** The title of the video */
   title: string;
   /** Short description of the video */
   description: string;
   /** Extended description of the video */
   long_description: string;
}

/**
 * Represents the raw response structure from the Brightcove API
 * @interface BrightcoveResponse
 */
interface BrightcoveResponse {
   /** Array of video sources with their URLs */
   sources: Array<{ src: string }>;
   /** The name/title of the video */
   name: string;
   /** Short description of the video content */
   description: string;
   /** Extended description of the video content */
   long_description: string;
}

// FIXME: This api needs to be review for changes/updates as it may no longer function as expected.

/**
 * Fetches video information from Brightcove API for a given video ID
 * @async
 * @param {string} videoId - The unique identifier of the video in Brightcove
 * @returns {Promise<BrightcoveResponse | null>} The video information or null if the request fails
 */
async function getBrightcoveVideoInfo(
   videoId: string,
): Promise<BrightcoveResponse | null> {
   if (!videoId) {
      return null;
   }

   const url = `https://edge.api.brightcove.com/playback/v1/accounts/6415718365001/videos/${videoId}`;
   const headers = {
      'User-Agent':
         'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0',
      Accept:
         'application/json;pk=BCpkADawqM3l37Vq8trLJ95vVwxubXYZXYglAopEZXQTHTWX3YdalyF9xmkuknxjBgiMYwt8VZ_OZ1jAjYxz_yzuNh_cjC3uOaMspVTD-hZfNUHtNnBnhVD0Gmsih8TBF8QlQFXiCQM3W_u4ydJ1qK2Rx8ZutCUg3PHb7Q',
      'Accept-Language': 'en-CA,en-US;q=0.7,en;q=0.3',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'no-cors',
      'Sec-Fetch-Site': 'cross-site',
      Pragma: 'no-cache',
      'Cache-Control': 'no-cache',
      Priority: 'u=4',
      Referer: 'https://www.nhl.com/',
   };

   try {
      const response = await fetch(url, { headers });
      if (response.ok) {
         return await response.json();
      }
   } catch (error) {
      console.error(`Error fetching video info: ${error}`);
   }

   return null;
}

/**
 * Retrieves formatted video metadata including URL and descriptions
 * @async
 * @param {string} videoId - The unique identifier of the video in Brightcove
 * @returns {Promise<VideoMetadata>} Object containing video metadata or default values if video is unavailable
 * @example
 * ```
 * const metadata = await getVideoMetadata("12345");
 * console.log(metadata.url); // URL of the video or null if unavailable
 * ```
 */
export async function getVideoMetadata(
   videoId: string,
): Promise<VideoMetadata> {
   const emptyVideoMetadata: VideoMetadata = {
      url: null,
      title: 'N/A',
      description: 'No replay.',
      long_description: 'This replay is unavailable or does not exist.',
   };

   if (!videoId) {
      return emptyVideoMetadata;
   }

   const videoInfo = await getBrightcoveVideoInfo(videoId);
   if (!videoInfo) {
      return emptyVideoMetadata;
   }

   return {
      url: videoInfo.sources[videoInfo.sources.length - 1]?.src || null,
      title: videoInfo.name,
      description: videoInfo.description,
      long_description: videoInfo.long_description,
   };
}
