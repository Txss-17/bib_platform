function playCashRegisterSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const playTone = (freq, start, duration, gain) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + start + duration * 0.3);
      g.gain.setValueAtTime(gain, ctx.currentTime + start);
      g.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + start + duration);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };
    playTone(1200, 0, 0.08, 0.3);
    playTone(1600, 0.06, 0.08, 0.3);
    playTone(2400, 0.12, 0.15, 0.4);
    playTone(3200, 0.15, 0.2, 0.3);
    setTimeout(() => ctx.close(), 1e3);
  } catch (e) {
  }
}
export {
  playCashRegisterSound
};
