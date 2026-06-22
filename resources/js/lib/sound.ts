/**
 * Plays a pleasant double-tone notification chime using the Web Audio API.
 * This synthesizes a E6 note followed by an A6 note for a premium sound feel,
 * and doesn't require downloading static MP3 assets.
 */
export function playNotificationChime(): void {
    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) {
            return;
        }

        const ctx = new AudioContextClass();
        const now = ctx.currentTime;

        // Note 1: E6 (1318.51 Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1318.51, now);
        
        // Premium fade-out envelope
        gain1.gain.setValueAtTime(0.12, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.3);

        // Note 2: A6 (1760.00 Hz) starting slightly later
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1760.00, now + 0.12);
        
        gain2.gain.setValueAtTime(0.12, now + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
        
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.12);
        osc2.stop(now + 0.42);
    } catch (error) {
        console.warn('Failed to play notification chime:', error);
    }
}
