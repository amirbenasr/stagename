export interface SynthesizeResult {
  audio: Buffer;
  contentType: string;
}

export interface TTSProvider {
  readonly name: string;
  synthesize(text: string, voiceId?: string): Promise<SynthesizeResult>;
}
