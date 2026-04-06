// Cash register / money notification sound using Web Audio API
export function playCashRegisterSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Coin drop sound
    const playTone = (freq: number, start: number, duration: number, gain: number) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + start + duration * 0.3);
      g.gain.setValueAtTime(gain, ctx.currentTime + start);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    // Cash register "cha-ching" pattern
    playTone(1200, 0, 0.08, 0.3);
    playTone(1600, 0.06, 0.08, 0.3);
    playTone(2400, 0.12, 0.15, 0.4);
    playTone(3200, 0.15, 0.2, 0.3);
    
    // Cleanup
    setTimeout(() => ctx.close(), 1000);
  } catch (e) {
    // Silently fail if audio not supported
  }
}
