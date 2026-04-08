export type FeedVideoMetadata = {
    duration: number;
    width: number;
    height: number;
    codec: string;
    bitrate: number;
};

export abstract class FeedVideoTranscoderPort {
    abstract convertToHLS(inputFile: string, outputDir: string, resolutions?: number[]): Promise<void>;

    abstract generateThumbnail(videoFile: string, outputFile: string, timePercent?: number): Promise<void>;

    abstract getVideoMetadata(videoFile: string): Promise<FeedVideoMetadata>;
}
