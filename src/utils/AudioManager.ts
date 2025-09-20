type SoundState = 'idle' | 'loading' | 'ready' | 'playing' | 'stopping' | 'unloading';

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private state: SoundState = 'idle';
  private currentUrl: string | null = null;
  private transitionId = 0;
  private volume = 1;
  private isMuted = false;
  private fadeTimeout: NodeJS.Timeout | null = null;
  private onStateChange: ((state: SoundState) => void) | null = null;
    sound: any;

  constructor(onStateChange?: (state: SoundState) => void) {
    this.onStateChange = onStateChange || null;
  }

  private setState(newState: SoundState) {
    this.state = newState;
    this.onStateChange?.(newState);
  }

  async play(url: string, options: { fadeIn?: boolean } = {}) {
    const myTransitionId = ++this.transitionId;
    
    // Cancel any ongoing operations
    await this.stop();
    
    // If this is not the most recent play request, ignore
    if (myTransitionId !== this.transitionId) return;
    
    this.currentUrl = url;
    this.setState('loading');

    try {
      // Create audio context if it doesn't exist
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      // Fetch and decode audio data
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      // If another play was requested while loading, clean up
      if (myTransitionId !== this.transitionId) {
        this.cleanup();
        return;
      }
      
      this.setState('ready');
      
      // Create source and gain nodes
      this.sourceNode = this.audioContext.createBufferSource();
      this.gainNode = this.audioContext.createGain();
      
      // Connect nodes: source -> gain -> destination
      this.sourceNode.buffer = this.audioBuffer;
      this.sourceNode.loop = true;
      this.sourceNode.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);
      
      // Start playback
      this.sourceNode.start(0);
      this.setState('playing');
      
      // Apply fade in if requested
      if (options.fadeIn) {
        await this.fadeTo(0, this.volume, 500);
      } else {
        await this.setVolume(this.volume);
      }
      
    } catch (error) {
      console.warn('Audio playback failed:', error);
      this.cleanup();
      throw error;
    }
  }

  async stop(fadeOut: boolean = true): Promise<void> {
    if (this.state === 'idle' || (!this.sourceNode && !this.audioBuffer)) return;
    
    // If already stopping/unloading, wait for it to complete
    if (this.state === 'stopping' || this.state === 'unloading') {
      return new Promise(resolve => {
        const check = () => {
          if (this.state === 'idle') {
            resolve();
          } else {
            setTimeout(check, 10);
          }
        };
        check();
      });
    }
    
    this.setState('stopping');
    
    try {
      if (fadeOut) {
        await this.fadeTo(this.volume, 0, 500);
      }
      
      await this.unload();
    } catch (error) {
      console.warn('Error stopping audio:', error);
      await this.cleanup();
    }
  }

  private async unload(): Promise<void> {
    if (this.state === 'idle') return;
    
    this.setState('unloading');
    
    try {
      // Mute before stopping to prevent glitches
      if (this.gainNode) {
        this.gainNode.gain.value = 0;
      }
      
      // Stop and disconnect nodes
      if (this.sourceNode) {
        try {
          this.sourceNode.stop();
        } catch (e) {}
        this.sourceNode.disconnect();
        this.sourceNode = null;
      }
      
      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }
      
      this.audioBuffer = null;
    } catch (error) {
      console.warn('Error during audio unload:', error);
    } finally {
      this.cleanup();
    }
  }

  async setMuted(muted: boolean) {
    this.isMuted = muted;
    const targetVolume = muted ? 0 : this.volume;
    await this.setVolume(targetVolume);
  }

  private async setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    const targetVolume = this.isMuted ? 0 : this.volume;
    
    if (this.gainNode) {
      try {
        this.gainNode.gain.setValueAtTime(targetVolume, this.audioContext?.currentTime || 0);
      } catch (error) {
        console.warn('Error setting volume:', error);
      }
    }
  }

  private async fadeTo(from: number, to: number, duration: number): Promise<void> {
    if (this.fadeTimeout) {
      clearTimeout(this.fadeTimeout);
      this.fadeTimeout = null;
    }
    
    if (!this.sound) return Promise.resolve();
    
    return new Promise(resolve => {
      const startTime = performance.now();
      const step = async (timestamp: number) => {
        if (!this.sound || this.state === 'unloading' || this.state === 'idle') {
          return resolve();
        }
        
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentVolume = from + (to - from) * progress;
        
        await this.setVolume(currentVolume);
        
        if (progress < 1) {
          this.fadeTimeout = setTimeout(() => {
            requestAnimationFrame(step);
          }, 16); // ~60fps
        } else {
          this.fadeTimeout = null;
          resolve();
        }
      };
      
      requestAnimationFrame(step);
    });
  }

  private cleanup() {
    if (this.fadeTimeout) {
      clearTimeout(this.fadeTimeout);
      this.fadeTimeout = null;
    }
    
    // Clean up audio context if it exists
    if (this.audioContext?.state !== 'closed') {
      try {
        this.audioContext?.close();
      } catch (e) {}
    }
    
    this.audioContext = null;
    this.audioBuffer = null;
    this.sourceNode = null;
    this.gainNode = null;
    this.currentUrl = null;
    this.setState('idle');
  }

  getCurrentState(): SoundState {
    return this.state;
  }

  getCurrentUrl(): string | null {
    return this.currentUrl;
  }

  async dispose() {
    await this.stop();
    this.cleanup();
  }
}
