export type FeedVideoMetadata = {
    duration: number;
    width: number;
    height: number;
    codec: string;
    bitrate: number;
};

export const FEED_VIDEO_TRANSCODER_PORT = Symbol('FEED_VIDEO_TRANSCODER_PORT');

export interface FeedVideoTranscoderPort {
    convertToHLS(inputFile: string, outputDir: string, resolutions?: number[]): Promise<void>;

    generateThumbnail(videoFile: string, outputFile: string, timePercent?: number): Promise<void>;

    getVideoMetadata(videoFile: string): Promise<FeedVideoMetadata>;
}
