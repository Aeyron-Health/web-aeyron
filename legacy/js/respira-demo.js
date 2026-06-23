    (function () {
        'use strict';

        const FPS = 30;
        const METRICS = [
            { id: 'hr',     name: 'Heart Rate',       unit: 'BPM',   warmupSec: 15, hwWarn: 'Browser estimate — Respira hardware achieves ±2 BPM' },
            { id: 'br',     name: 'Breath Rate',       unit: 'BrPM',  warmupSec: 30, hwWarn: 'Browser estimate — hardware achieves ±0.5 BrPM' },
            { id: 'dist',   name: 'Distance',          unit: 'cm',    warmupSec: 2,  hwWarn: '' },
            { id: 'blink',  name: 'Blink Rate',        unit: '/min',  warmupSec: 30, hwWarn: 'Ensure face is well lit for best results' },
            { id: 'voice',  name: 'Voice Strength',    unit: 'dB',    warmupSec: 10, hwWarn: 'Speak naturally for 10 seconds to calibrate' },
            { id: 'cough',  name: 'Cough Detection',   unit: 'event', warmupSec: 0,  hwWarn: '' },
        ];
        const HW_WARN_IDS = new Set(['hr', 'br', 'voice']);

        /* ── State ── */
        let stream = null, fingerStream = null;
        let audioCtx = null, analyserAudio = null, animRaf = null;
        let startTime = null, frameCount = 0, hrMode = 'face';
        const cardEls = {}, warmupTimers = {}, valStates = {};
        let faceRoi = null;
        /* Breath rate HP/LP filter state (fed at ~10fps from pose/facemesh) */
        let brHpPrev=0, brHpOut=0, brLpOut=0, brPrevFilt=null;
        let brBreathTimes=[], brLastPeakAt=0, brBreathStart=0;
        /* MediaPipe Pose (shoulder-based breath signal) */
        let poseModel=null, posePending=false, poseTick=0, poseShoulderActive=false;
        /* Neural rPPG (ME-rPPG ONNX — loaded once, reused across sessions) */
        let nnSession=null, nnWelchSession=null, nnHrSession=null;
        let nnState=null, nnStateData=null, nnReady=false, nnFailed=false;
        let nnBvpBuf=[], nnLastTs=null, nnFrameTs=[];
        let nnCanvas=null, nnCtx=null, nnHrCache=null, nnHrCacheAt=0, nnRunning=false;
        const NN_BASE='https://cdn.jsdelivr.net/gh/Health-HCI-Group/ME-rPPG-demo@main/';
        const NN_LAMBDA=33.33; /* normalize Δt → ~1.0 at 30fps (ms units) */

        /* ── DOM refs ── */
        const overlay    = document.getElementById('demo-overlay');
        const openBtn    = document.getElementById('demo-open-btn');
        const closeBtn   = document.getElementById('demo-close-btn');
        const videoEl    = document.getElementById('demo-video');
        const metricsCol = document.getElementById('demo-metrics-col');
        const breathRing = document.getElementById('demo-breath-ring');
        const pilotLink  = document.getElementById('demo-pilot-link');
        const permScreen = document.getElementById('demo-perm-screen');
        const allowBtn   = document.getElementById('demo-allow-btn');
        const cancelLink = document.getElementById('demo-cancel-link');
        const loadScreen = document.getElementById('demo-load-screen');
        const loadBar    = document.getElementById('demo-load-bar');
        const loadStatus = document.getElementById('demo-load-status');
        const errScreen  = document.getElementById('demo-error-screen');
        const errH       = document.getElementById('demo-error-h');
        const errMsg     = document.getElementById('demo-error-msg');
        const errClose   = document.getElementById('demo-error-close');
        const demoMain   = document.getElementById('demo-main');

        /* ── Screen management ── */
        function showScreen(w) {
            permScreen.style.display = w==='perm'    ? 'flex' : 'none';
            loadScreen.style.display = w==='loading' ? 'flex' : 'none';
            errScreen.style.display  = w==='error'   ? 'flex' : 'none';
            demoMain.style.cssText   = w==='running'
                ? 'display:flex;flex-direction:column;flex:1' : 'display:none';
        }

        /* ── Cards ── */
        function buildCards() {
            metricsCol.innerHTML = '';
            METRICS.forEach(m => {
                const card = document.createElement('div');
                card.className = 'demo-card' + (HW_WARN_IDS.has(m.id) ? ' card-hw-warn' : '');
                card.id = 'dcard-' + m.id;
                const initDot = m.id === 'hr' ? 'sq-exp' : 'sq-wait';
                const hrExtra = m.id === 'hr'
                    ? '<div class="demo-card-exp">Experimental · research grade only</div>' +
                      '<button class="demo-hr-mode-btn" id="demo-hr-mode-btn">Finger Mode</button>'
                    : '';
                card.innerHTML = `
                    <div class="demo-card-top">
                        <span class="demo-card-name">${m.name}</span>
                        <span class="demo-sq-dot ${initDot}" id="dsq-${m.id}"></span>
                    </div>
                    ${hrExtra}
                    <div class="demo-card-value" id="dval-${m.id}">—</div>
                    <div class="demo-card-unit" id="dunit-${m.id}">${m.unit}</div>
                    ${m.hwWarn ? `<div class="demo-hw-warn-label">${m.hwWarn}</div>` : ''}
                    <div class="demo-warmup-bar-track">
                        <div class="demo-warmup-bar" id="dwb-${m.id}"></div>
                    </div>`;
                metricsCol.appendChild(card);
                cardEls[m.id] = card;
            });
            document.getElementById('demo-hr-mode-btn')?.addEventListener('click', toggleFingerMode);
        }

        function revealCards() {
            METRICS.forEach((m, i) => {
                setTimeout(() => { const c = cardEls[m.id]; if (c) c.classList.add('card-visible'); }, 200 + i * 120);
            });
        }

        function runWarmup(id, sec) {
            const bar = document.getElementById('dwb-' + id);
            if (!bar) return;
            const start = performance.now();
            const tick = () => {
                const pct = Math.min(100, (performance.now() - start) / (sec * 1000) * 100);
                bar.style.width = pct + '%';
                if (pct < 100) warmupTimers[id] = requestAnimationFrame(tick);
            };
            warmupTimers[id] = requestAnimationFrame(tick);
        }

        function setQuality(id, level) {
            if (id === 'hr') return;
            const dot = document.getElementById('dsq-' + id);
            if (dot) dot.className = 'demo-sq-dot sq-' + level;
        }

        /* setVal — smooth transitions + per-card minimum display intervals
           minDisp: minimum ms between display updates (prevents flickering)
           Null value: held for 10s then fades to "—" over 3s */
        const CARD_MIN_DISP = { hr:5000, br:10000, dist:5000, blink:60000, voice:1000, cough:0 };

        function setVal(id, v, _fromSignal) {
            const el = document.getElementById('dval-' + id);
            if (!el) return;
            if (!valStates[id]) valStates[id] = { lastGoodAt: 0, lastDispAt: 0 };
            const now = performance.now();
            const minDisp = CARD_MIN_DISP[id] || 0;

            if (v !== null && v !== undefined) {
                /* Enforce minimum display interval to prevent flickering.
                   Skip on first display (lastDispAt===0) so the very first value
                   always shows regardless of how soon after page-load it arrives. */
                if (valStates[id].lastDispAt > 0 && now - valStates[id].lastDispAt < minDisp) return;
                valStates[id].lastGoodAt = now;
                valStates[id].lastDispAt = now;
                el.style.transition = '';
                el.style.opacity = '1';
                el.textContent = String(v);
            } else if (now - valStates[id].lastGoodAt > 10000) {
                el.style.transition = 'opacity 3s';
                el.style.opacity = '0.3';
                el.textContent = '—';
            }
        }

        /* setStatus — updates display text without resetting the signal hold timer
           (used for "Calibrating…", "Speak to calibrate" etc.) */
        function setStatus(id, text) {
            const el = document.getElementById('dval-' + id);
            if (!el) return;
            if (!valStates[id]) valStates[id] = { lastGoodAt: 0, lastDispAt: 0 };
            /* Only show status if no real value has been shown yet */
            if (valStates[id].lastGoodAt > 0) return;
            el.style.transition = '';
            el.style.opacity = '0.55';
            el.textContent = text;
        }

        /* ── Signal processing utilities ── */
        /* 2nd-order Butterworth bandpass [0.7–4.0 Hz] at fs=30 Hz
           b = [0.2648, 0, -0.2648], a = [1, -1.3771, 0.4703] */
        function iirFwd(sig, b, a) {
            const out = new Array(sig.length);
            let x1=0, x2=0, y1=0, y2=0;
            for (let i=0; i<sig.length; i++) {
                const y = b[0]*sig[i] + b[1]*x1 + b[2]*x2 - a[1]*y1 - a[2]*y2;
                x2=x1; x1=sig[i]; y2=y1; y1=y; out[i]=y;
            }
            return out;
        }
        function filtfilt(sig) {
            const B=[0.2648,0,-0.2648], A=[1,-1.3771,0.4703];
            return iirFwd(iirFwd(sig,B,A).reverse(),B,A).reverse();
        }

        /* Goertzel power for integer bin k in length-n signal */
        function goertzelPow(sig, k) {
            const n=sig.length, coeff=2*Math.cos(2*Math.PI*k/n);
            let s1=0, s2=0;
            for (let i=0; i<n; i++) { const s0=sig[i]+coeff*s1-s2; s2=s1; s1=s0; }
            return s1*s1+s2*s2-coeff*s1*s2;
        }

        function hannWin(n) {
            return Array.from({length:n}, (_,i)=>0.5*(1-Math.cos(2*Math.PI*i/(n-1))));
        }

        /* Scalar Kalman: R=measurement noise, Q=process noise */
        function makeKalman(R, Q) {
            let x=0, vel=0, P00=1000, P01=0, P10=0, P11=1000, init=false;
            return {
                update(z) {
                    if (!init) { x=z; init=true; return z; }
                    const xp=x+vel, vp=vel;
                    const p00=P00+P01+P10+P11+Q, p01=P01+P11, p10=P10+P11, p11=P11+Q;
                    const S=p00+R, K0=p00/S, K1=p10/S, inn=z-xp;
                    x=xp+K0*inn; vel=vp+K1*inn;
                    P00=p00-K0*p00; P01=p01-K0*p01; P10=p10-K1*p00; P11=p11-K1*p01;
                    return x;
                },
                reset() { x=0; vel=0; P00=1000; P01=0; P10=0; P11=1000; init=false; }
            };
        }

        /* ── rPPG: CHROM algorithm ── */
        const CHROM_BUF = 512;
        let rgbBuf = [];
        const hrKalman = makeKalman(50, 0.01);
        let hrLastGood=null, hrLastGoodAt=0, hrLastDispAt=0;
        let faceCanvas, faceCtx;

        function initFaceCanvas() {
            faceCanvas = document.createElement('canvas');
            faceCanvas.width=160; faceCanvas.height=120;
            faceCtx = faceCanvas.getContext('2d', {willReadFrequently:true});
        }

        /* ── Neural rPPG functions ── */
        function initNNCanvas() {
            nnCanvas=document.createElement('canvas'); nnCanvas.width=36; nnCanvas.height=36;
            nnCtx=nnCanvas.getContext('2d',{willReadFrequently:true});
        }

        function extractNN36() {
            if (!nnCtx||videoEl.readyState<2) return null;
            if (faceRoi) nnCtx.drawImage(videoEl,faceRoi.x,faceRoi.y,faceRoi.w,faceRoi.h,0,0,36,36);
            else { const vW=videoEl.videoWidth||640,vH=videoEl.videoHeight||480; nnCtx.drawImage(videoEl,vW*.25,vH*.1,vW*.5,vH*.8,0,0,36,36); }
            return nnCtx.getImageData(0,0,36,36).data;
        }

        function buildNNState() {
            if (!nnStateData||typeof ort==='undefined') return null;
            const shapeOf=v=>{const s=[];let c=v;while(Array.isArray(c)){s.push(c.length);c=c[0];}return s;};
            const st={};
            for (const [k,v] of Object.entries(nnStateData))
                st[k]=new ort.Tensor('float32',new Float32Array([v].flat(Infinity)),shapeOf(v));
            return st;
        }

        async function loadNeuralRPPG(onProg) {
            try {
                if (typeof ort==='undefined') {
                    await new Promise((res,rej)=>{
                        const s=document.createElement('script');
                        s.src='https://fastly.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/ort.min.js';
                        s.crossOrigin='anonymous'; s.onload=res; s.onerror=rej;
                        document.head.appendChild(s);
                    });
                }
                ort.env.wasm.wasmPaths='https://fastly.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/';
                onProg?.(0.2);
                [nnSession,nnWelchSession,nnHrSession]=await Promise.all([
                    ort.InferenceSession.create(NN_BASE+'model.onnx',{executionProviders:['wasm']}),
                    ort.InferenceSession.create(NN_BASE+'welch_psd.onnx',{executionProviders:['wasm']}),
                    ort.InferenceSession.create(NN_BASE+'get_hr.onnx',{executionProviders:['wasm']}),
                ]);
                onProg?.(0.55);
                nnStateData=await fetch(NN_BASE+'state.json').then(r=>r.json());
                onProg?.(0.85);
                nnState=buildNNState();
                nnReady=true;
                /* Update HR card subtitle once model is confirmed loaded */
                METRICS[0].hwWarn='Neural rPPG — Respira hardware achieves ±2 BPM';
                const wl=document.getElementById('dcard-hr')?.querySelector('.demo-hw-warn-label');
                if (wl) wl.textContent=METRICS[0].hwWarn;
            } catch(e) { nnFailed=true; /* silent — POS fallback takes over */ }
        }

        async function inferNeuralFrame(pixels,ts) {
            if (!nnSession||!nnState||nnRunning) return;
            nnRunning=true;
            try {
                const rgb=new Float32Array(36*36*3);
                for (let i=0,j=0;i<pixels.length;i+=4,j+=3){rgb[j]=pixels[i]/255;rgb[j+1]=pixels[i+1]/255;rgb[j+2]=pixels[i+2]/255;}
                const dt=Math.max(nnLastTs?(ts-nnLastTs)/NN_LAMBDA:1.0,1/90);
                nnLastTs=ts; nnFrameTs.push(ts); if(nnFrameTs.length>300) nnFrameTs.shift();
                const feeds={};
                feeds[nnSession.inputNames[0]]=new ort.Tensor('float32',rgb,[1,1,36,36,3]);
                for (const [k,v] of Object.entries(nnState)) feeds[k]=v;
                feeds[nnSession.inputNames[37]]=new ort.Tensor('float32',[dt],[]);
                const out=await nnSession.run(feeds);
                for (let i=1;i<nnSession.outputNames.length;i++) nnState[nnSession.inputNames[i]]=out[nnSession.outputNames[i]];
                const bvp=out[nnSession.outputNames[0]].cpuData[0];
                nnBvpBuf.push(bvp); if(nnBvpBuf.length>300) nnBvpBuf.shift();
            } catch(e) { nnFailed=true; nnReady=false; }
            nnRunning=false;
        }

        async function computeNeuralHR() {
            if (!nnWelchSession||!nnHrSession||nnBvpBuf.length<300) return null;
            try {
                const wOut=await nnWelchSession.run({input:new ort.Tensor('float32',new Float32Array(nnBvpBuf),[1,1,300])});
                let hr=(await nnHrSession.run({freqs:wOut.freqs,psd:wOut.psd}))['hr'].cpuData[0];
                /* FPS correction: model calibrated at 30fps */
                if (nnFrameTs.length>=300){const dur=(nnFrameTs[nnFrameTs.length-1]-nnFrameTs[0])/1000;if(dur>0)hr=(hr/30)*(nnFrameTs.length/dur);}
                return (hr>=48&&hr<=115)?Math.round(hr):null;
            } catch(e){return null;}
        }

        function extractRGB() {
            if (!faceCtx || videoEl.readyState<2) return null;
            if (hrMode==='finger') {
                faceCtx.drawImage(videoEl, 0, 0, 160, 120);
            } else if (faceRoi) {
                faceCtx.drawImage(videoEl, faceRoi.x, faceRoi.y, faceRoi.w, faceRoi.h, 0, 0, 160, 120);
            } else {
                /* No face ROI yet — crop center 50%×60% of frame where face typically is */
                const vW=videoEl.videoWidth||640, vH=videoEl.videoHeight||480;
                faceCtx.drawImage(videoEl, vW*0.25, vH*0.05, vW*0.5, vH*0.6, 0, 0, 160, 120);
            }
            const d=faceCtx.getImageData(0,0,160,120).data;
            let r=0, g=0, b=0, n=0;
            for (let i=0; i<d.length; i+=4) {
                /* Exclude only saturated-white specular pixels; accept dim skin pixels for low-light */
                const lum=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2];
                if (lum>5&&lum<245) { r+=d[i]; g+=d[i+1]; b+=d[i+2]; n++; }
            }
            return n>80 ? [r/n,g/n,b/n] : null;
        }

        function computeHR(buf) {
            /* POS (Plane-Orthogonal-to-Skin, Wang et al. 2017) — outperforms CHROM
               per 2024-2025 benchmarks on UBFC/PURE datasets under realistic webcam conditions */
            const minLen = hrMode==='finger' ? FPS*3 : FPS*10;
            if (buf.length<minLen) return {bpm:null,snr:0};
            const mn = a => a.reduce((s,v)=>s+v,0)/a.length;
            const sd = a => { const m=mn(a); return Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/a.length)+1e-8; };
            const r=buf.map(x=>x[0]), g=buf.map(x=>x[1]), b=buf.map(x=>x[2]);
            let sig;
            if (hrMode==='finger') {
                /* Finger: red-channel linear detrend */
                const t=r.map((_,i)=>i), tm=mn(t), rm=mn(r);
                const sl=r.reduce((s,v,i)=>s+(t[i]-tm)*(v-rm),0)/(t.reduce((s,v)=>s+(v-tm)**2,0)+1e-8);
                sig=r.map((v,i)=>v-sl*i-(rm-sl*tm));
            } else {
                /* POS: normalize by temporal mean, project onto skin-orthogonal plane */
                const Rn=r.map(v=>v/(mn(r)+1e-8)), Gn=g.map(v=>v/(mn(g)+1e-8)), Bn=b.map(v=>v/(mn(b)+1e-8));
                const S1=Rn.map((_,i)=>Gn[i]-Bn[i]);           /* P row [0, 1,-1] */
                const S2=Rn.map((_,i)=>-2*Rn[i]+Gn[i]+Bn[i]); /* P row [-2,1, 1] */
                const alpha=sd(S1)/sd(S2);
                const ppg=S1.map((v,i)=>v-alpha*S2[i]);
                /* Linear detrend */
                const t=ppg.map((_,i)=>i), tm=mn(t), pm=mn(ppg);
                const sl=ppg.reduce((s,v,i)=>s+(t[i]-tm)*(v-pm),0)/(t.reduce((s,v)=>s+(v-tm)**2,0)+1e-8);
                sig=ppg.map((v,i)=>v-sl*i-(pm-sl*tm));
            }
            const filtered=filtfilt(sig);
            /* Multi-window spectral voting: estimate HR at 3 window sizes,
               pick the candidate with highest SNR — reduces single-window artifacts */
            const candidates=[];
            for (const wlen of [128,192,256]) {
                if (filtered.length<wlen) continue;
                const seg=filtered.slice(-wlen);
                const win=hannWin(wlen);
                const wsig=seg.map((v,i)=>v*win[i]);
                const freqRes=FPS/wlen;
                const minBin=Math.max(1,Math.ceil(0.75/freqRes)), maxBin=Math.floor(3.5/freqRes);
                if (maxBin<=minBin) continue;
                let peakPow=0, peakBin=minBin, totalPow=0;
                for (let k=minBin; k<=maxBin; k++) {
                    const p=goertzelPow(wsig,k); totalPow+=p;
                    if (p>peakPow) { peakPow=p; peakBin=k; }
                }
                const snrW=peakPow/(totalPow/(maxBin-minBin+1)+1e-8);
                const bpm=Math.round(peakBin*freqRes*60);
                if (bpm>=48&&bpm<=115&&snrW>0.3) candidates.push({bpm,snr:snrW});
            }
            if (!candidates.length) return {bpm:null,snr:0};
            candidates.sort((a,b)=>b.snr-a.snr);
            /* Boost confidence if two windows agree within 6 BPM */
            const agreedSnr=candidates.length>=2&&Math.abs(candidates[0].bpm-candidates[1].bpm)<=6
                ? candidates[0].snr*1.4 : candidates[0].snr;
            return {bpm:candidates[0].bpm, snr:agreedSnr};
        }

        /* ── Finger mode toggle ── */
        async function toggleFingerMode() {
            const btn=document.getElementById('demo-hr-mode-btn');
            if (hrMode==='face') {
                if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                    setVal('hr','Finger mode needs a mobile device'); return;
                }
                if (btn) btn.textContent='Switching…';
                try {
                    const vs=await navigator.mediaDevices.getUserMedia({
                        video:{facingMode:{ideal:'environment'},width:320,height:240}
                    });
                    stream?.getVideoTracks().forEach(t=>t.stop());
                    fingerStream=vs;
                    videoEl.srcObject=new MediaStream([...vs.getVideoTracks(),...(stream?.getAudioTracks()||[])]);
                    const vt=vs.getVideoTracks()[0];
                    if (vt?.getCapabilities?.()?.torch) {
                        await vt.applyConstraints({advanced:[{torch:true}]}).catch(()=>{});
                    }
                    hrMode='finger'; rgbBuf=[]; hrKalman.reset(); hrLastGood=null;
                    cardEls.hr?.classList.replace('card-hw-warn','card-hw-ok');
                    const u=document.getElementById('dunit-hr'); if(u) u.textContent='BPM · Finger';
                    if (btn) btn.textContent='Face Mode';
                } catch(e) { if(btn) btn.textContent='Finger Mode'; }
            } else {
                fingerStream?.getTracks().forEach(t=>t.stop()); fingerStream=null;
                hrMode='face'; rgbBuf=[]; hrKalman.reset(); hrLastGood=null;
                videoEl.srcObject=stream;
                cardEls.hr?.classList.replace('card-hw-ok','card-hw-warn');
                const u=document.getElementById('dunit-hr'); if(u) u.textContent='BPM';
                if(btn) btn.textContent='Finger Mode';
            }
        }

        /* ── Breath rate: HP/LP filter + zero-crossing peak detection ──
           Effective sample rate ~10fps (FaceMesh/Pose fire every 3 frames).
           HP α=0.941 → cutoff ~0.1 Hz;  LP α=0.239 → cutoff ~0.5 Hz (6–30 BrPM passband) */
        let lastBR=null;
        const brKalman=makeKalman(10,0.1);
        const BR_HP_A=0.941, BR_LP_A=0.239;

        function updateBreathFilter(rawY) {
            brHpOut=BR_HP_A*(brHpOut+rawY-brHpPrev); brHpPrev=rawY;
            brLpOut+=BR_LP_A*(brHpOut-brLpOut);
            const now=performance.now();
            /* Upward zero-cross = end of breath exhale = one breath event */
            if (brPrevFilt!==null&&brPrevFilt<0&&brLpOut>=0) {
                if (now-brLastPeakAt>2000) { /* min 2s inter-breath = max 30 BrPM */
                    if (!brBreathStart) brBreathStart=now;
                    brBreathTimes.push(now); brLastPeakAt=now;
                    while(brBreathTimes.length&&brBreathTimes[0]<now-30000) brBreathTimes.shift();
                }
            }
            brPrevFilt=brLpOut;
        }

        function estimateBR() {
            if (!brBreathStart||brBreathTimes.length<2) return null;
            const elapsed=(performance.now()-brBreathStart)/1000;
            if (elapsed<12) return null;
            const rate=brBreathTimes.length/Math.min(elapsed,30)*60;
            return (rate>=8&&rate<=25)?Math.round(rate):null;
        }

        /* ── MediaPipe Face Mesh (blink + distance + breath fallback signal) ── */
        let faceMesh=null, fmPending=false, fmTick=0;
        const blinkTimes=[];
        let prevEAR=null, earThresh=0.2, earCalibBuf=[], earCalibDone=false, blinkStart=null;
        let lastDistCm=null, distUpdAt=0;
        const LEFT_EYE=[33,160,158,133,153,144], RIGHT_EYE=[362,385,387,263,373,380];
        const ed=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
        const ear=(lm,p)=>(ed(lm[p[1]],lm[p[5]])+ed(lm[p[2]],lm[p[4]]))/(2*ed(lm[p[0]],lm[p[3]])+1e-8);

        function initFaceMesh() {
            if (typeof FaceMesh==='undefined') return;
            faceMesh=new FaceMesh({locateFile:f=>`https://unpkg.com/@mediapipe/face_mesh@0.4.1633559619/${f}`});
            faceMesh.setOptions({maxNumFaces:1,refineLandmarks:true,minDetectionConfidence:0.5,minTrackingConfidence:0.5});
            faceMesh.onResults(r=>{
                if (!r.multiFaceLandmarks?.length) { prevEAR=null; return; }
                const lm=r.multiFaceLandmarks[0];
                const e=(ear(lm,LEFT_EYE)+ear(lm,RIGHT_EYE))/2;
                if (!earCalibDone) {
                    earCalibBuf.push(e);
                    if (earCalibBuf.length>=150) {
                        const s=[...earCalibBuf].sort((a,b)=>a-b);
                        earThresh=s[Math.floor(s.length*0.7)]*0.65;
                        earCalibDone=true;
                    }
                }
                if (prevEAR!==null&&prevEAR>=earThresh&&e<earThresh) {
                    const ts=performance.now();
                    if (!blinkStart) blinkStart=ts;
                    blinkTimes.push(ts);
                    while(blinkTimes.length&&blinkTimes[0]<ts-60000) blinkTimes.shift();
                }
                prevEAR=e;
                /* Face bounding box → better rPPG crop (forehead/cheeks only) */
                const vW=videoEl.videoWidth||640, vH=videoEl.videoHeight||480;
                let fMinX=Infinity, fMaxX=-Infinity, fMinY=Infinity, fMaxY=-Infinity;
                for (let i=0;i<468;i++) {
                    const px=lm[i].x*vW, py=lm[i].y*vH;
                    if(px<fMinX)fMinX=px; if(px>fMaxX)fMaxX=px;
                    if(py<fMinY)fMinY=py; if(py>fMaxY)fMaxY=py;
                }
                const fw=fMaxX-fMinX, fhf=fMaxY-fMinY;
                faceRoi={x:fMinX+fw*0.1, y:fMinY+fhf*0.1, w:fw*0.8, h:fhf*0.5};
                /* Breath fallback: chin landmark y oscillates subtly with breathing */
                if (!poseShoulderActive) updateBreathFilter(lm[152].y);
                /* Distance — iris diameter (preferred) with face-width fallback */
                const now=performance.now();
                if (now-distUpdAt>2000) {
                    let distSet=false;
                    /* Primary: iris landmarks (refineLandmarks:true gives lm[469–477]) */
                    if (lm.length>477&&lm[469]&&lm[471]&&lm[474]&&lm[476]) {
                        const irisL=ed(lm[469],lm[471])*(videoEl.videoWidth||640);
                        const irisR=ed(lm[474],lm[476])*(videoEl.videoWidth||640);
                        const irisPx=(irisL+irisR)/2;
                        if (irisPx>2) {
                            lastDistCm=Math.round(Math.max(20,Math.min(200,702/irisPx)));
                            distUpdAt=now; distSet=true;
                        }
                    }
                    /* Fallback: face bounding-box width (iris model absent or not loaded yet)
                       Face ≈15cm wide; for a 640px stream with ~60° FOV: dist≈9000/faceWidthPx */
                    if (!distSet&&fw>20) {
                        lastDistCm=Math.round(Math.max(20,Math.min(200,9000/fw)));
                        distUpdAt=now;
                    }
                }
            });
        }

        function sendFaceMesh() {
            if (!faceMesh||videoEl.readyState<2||fmPending||hrMode==='finger') return;
            if (++fmTick%3!==0) return;
            fmPending=true;
            faceMesh.send({image:videoEl}).then(()=>{fmPending=false;}).catch(()=>{fmPending=false;});
        }

        /* ── MediaPipe Pose (shoulder-based breath rate — primary signal when visible) ── */
        function initPose() {
            if (typeof Pose==='undefined') return;
            poseModel=new Pose({locateFile:f=>`https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${f}`});
            poseModel.setOptions({modelComplexity:0,smoothLandmarks:true,minDetectionConfidence:0.5,minTrackingConfidence:0.5});
            poseModel.onResults(r=>{
                if (!r.poseLandmarks) { poseShoulderActive=false; return; }
                const L=r.poseLandmarks[11], R=r.poseLandmarks[12];
                if (L&&R&&(L.visibility||0)>0.5&&(R.visibility||0)>0.5) {
                    poseShoulderActive=true;
                    updateBreathFilter((L.y+R.y)/2);
                } else {
                    poseShoulderActive=false;
                }
            });
        }

        function sendPose() {
            if (!poseModel||videoEl.readyState<2||posePending) return;
            if (++poseTick%3!==0) return;
            posePending=true;
            poseModel.send({image:videoEl}).then(()=>{posePending=false;}).catch(()=>{posePending=false;});
        }

        function getBlinkRate() {
            if (!blinkStart) return null;
            const elapsed=(performance.now()-blinkStart)/1000;
            if (elapsed<15) return null;
            const cutoff=performance.now()-60000;
            return Math.round(blinkTimes.filter(t=>t>cutoff).length/Math.min(elapsed,60)*60);
        }

        /* ── Audio ── */
        let coughCooldown=0, ambientRMS=null, ambientN=0, voiceReady=false;

        function setupAudio(track) {
            try {
                audioCtx=new (window.AudioContext||window.webkitAudioContext)();
                const src=audioCtx.createMediaStreamSource(new MediaStream([track]));
                analyserAudio=audioCtx.createAnalyser(); analyserAudio.fftSize=2048;
                src.connect(analyserAudio);
            } catch(e) {}
        }

        function readAudio() {
            if (!analyserAudio) return {db:null,cough:false,rms:0};
            const d=new Float32Array(analyserAudio.frequencyBinCount);
            analyserAudio.getFloatTimeDomainData(d);
            let sq=0;
            for (let i=0; i<d.length; i++) sq+=d[i]*d[i];
            const rms=Math.sqrt(sq/d.length);
            const db=rms>1e-6?Math.round(20*Math.log10(rms)):null;
            if (!voiceReady) {
                ambientN++;
                ambientRMS=ambientRMS===null?rms:ambientRMS*0.95+rms*0.05;
                if (ambientN>=150) voiceReady=true;
            }
            /* Adaptive cough threshold: 5× ambient floor, hard minimum 0.08 */
            const coughThresh=Math.max(0.08,(ambientRMS||0.01)*5);
            const cough=rms>coughThresh&&coughCooldown<=0;
            if (cough) coughCooldown=60;
            if (coughCooldown>0) coughCooldown--;
            return {db,cough,rms};
        }

        /* ── Render loop ── */
        function renderLoop() {
            animRaf=requestAnimationFrame(renderLoop);
            if (!startTime) startTime=performance.now();
            frameCount++;
            const elapsed=(performance.now()-startTime)/1000;
            const now=performance.now();

            const rgb=extractRGB();
            if (rgb) { rgbBuf.push(rgb); if(rgbBuf.length>CHROM_BUF) rgbBuf.shift(); }
            sendFaceMesh();
            sendPose();
            /* Neural rPPG — feed current frame (nnRunning gate prevents queue pile-up) */
            if (nnReady&&!nnFailed&&hrMode==='face'&&!nnRunning) {
                const pxls=extractNN36(); if(pxls) inferNeuralFrame(pxls,now);
            }

            if (frameCount%FPS===0) {
                /* Trigger neural HR computation every 5s once BVP buffer is full */
                if (nnReady&&!nnFailed&&frameCount%(FPS*5)===0) {
                    computeNeuralHR().then(hr=>{if(hr!==null){nnHrCache=hr;nnHrCacheAt=performance.now();}});
                }
                /* Heart Rate — neural path when loaded, POS fallback otherwise */
                if (elapsed<10) {
                    setStatus('hr','Calibrating…');
                } else if (nnReady&&!nnFailed) {
                    /* Neural path */
                    const raw=nnHrCacheAt&&now-nnHrCacheAt<15000?nnHrCache:null;
                    if (raw&&(hrLastGood===null||Math.abs(raw-hrLastGood)<=15)) {
                        const sm=Math.round(hrKalman.update(raw));
                        hrLastGood=sm; hrLastGoodAt=now;
                        if (now-hrLastDispAt>=5000){setVal('hr',sm);hrLastDispAt=now;}
                    } else if (hrLastGood!==null&&now-hrLastGoodAt<10000) {
                        const el=document.getElementById('dval-hr');
                        if(el&&el.textContent!==String(hrLastGood))el.textContent=String(hrLastGood);
                    } else if (!nnHrCacheAt||now-nnHrCacheAt>15000) {
                        if (!hrLastGood) setStatus('hr','Calibrating…'); else setVal('hr',null);
                    }
                } else {
                    /* POS fallback */
                    const {bpm:raw,snr}=computeHR(rgbBuf);
                    if (raw&&snr>=0.5) {
                        if (hrLastGood===null||Math.abs(raw-hrLastGood)<=15) {
                            const sm=Math.round(hrKalman.update(raw));
                            hrLastGood=sm; hrLastGoodAt=now;
                            if (now-hrLastDispAt>=5000){setVal('hr',sm);hrLastDispAt=now;}
                        }
                    } else if (hrLastGood!==null&&now-hrLastGoodAt<10000) {
                        const el=document.getElementById('dval-hr');
                        if(el&&el.textContent!==String(hrLastGood))el.textContent=String(hrLastGood);
                    } else {
                        /* Low signal — always show status, never silent */
                        if (!hrLastGood) {
                            setStatus('hr', elapsed>30 ? 'Need more light' : 'Calibrating…');
                        } else { setVal('hr',null); }
                    }
                }
                /* Chest-visible positioning hint — show when Pose can't find shoulders after 20s */
                const posHintEl=document.getElementById('demo-pos-hint');
                if (posHintEl) posHintEl.classList.toggle('visible',!poseShoulderActive&&elapsed>20);

                /* Breath Rate */
                const brRaw=estimateBR();
                if (brRaw!==null) {
                    const sm=Math.round(brKalman.update(brRaw));
                    if (lastBR===null||Math.abs(brRaw-lastBR)<=4) {
                        setVal('br',sm);   /* CARD_MIN_DISP enforces 10s */
                        if (lastBR!==sm) {
                            lastBR=sm;
                            setQuality('br','good');
                            breathRing.style.animation=`breathe-idle ${(60/sm).toFixed(2)}s ease-in-out infinite`;
                            breathRing.classList.add('breathing');
                        }
                    }
                } else if (elapsed>=45) { setVal('br',null); }
                else { setStatus('br','Calibrating…'); }

                /* Blink — CARD_MIN_DISP enforces 60s between display updates */
                const blink=getBlinkRate();
                if (blink!==null) {
                    if (blink>30) {
                        /* above physiological max — noise/artifact, hold last good */
                    } else if (blink<1) {
                        /* below minimum after calibration — show "—" */
                        setVal('blink',null);
                    } else {
                        setVal('blink',blink);
                        setQuality('blink',blink>=12&&blink<=20?'good':'warn');
                    }
                } else if (!earCalibDone || elapsed<15) {
                    setStatus('blink','Calibrating…');
                } else if (elapsed>=45&&blinkTimes.length===0) {
                    setVal('blink',null);
                }

                /* Voice */
                if (!voiceReady) setStatus('voice','Speak to calibrate');
            }

            /* Distance (every 2s via FaceMesh callback; update display here) */
            if (frameCount%(FPS*2)===0&&lastDistCm!==null) {
                setVal('dist',lastDistCm);
                setQuality('dist',lastDistCm>=40&&lastDistCm<=80?'good':'warn');
            }

            /* Audio 5fps */
            if (frameCount%6===0) {
                const {db,cough,rms}=readAudio();
                if (voiceReady&&ambientRMS!==null) {
                    const lv=rms>ambientRMS*3?'Elevated':rms>ambientRMS*0.5?'Normal':'Low';
                    const qual=lv==='Normal'?'good':'warn';
                    setVal('voice',db!==null?lv+' ('+db+' dB)':lv); setQuality('voice',qual);
                }
                if (cough) {
                    setVal('cough','1'); setQuality('cough','warn');
                    setTimeout(()=>{ setVal('cough','0'); setQuality('cough','good'); },1500);
                } else if (elapsed>1) {
                    const cv=document.getElementById('dval-cough');
                    if (cv&&cv.textContent!=='1') { setVal('cough','0'); setQuality('cough','good'); }
                }
            }
        }

        /* ── Open / permissions / start ── */
        function openDemo() {
            overlay.classList.add('demo-open');
            document.body.style.overflow='hidden';
            showScreen('perm');
        }

        async function startCamera() {
            showScreen('loading');
            const isMobile=/iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            loadBar.style.width='10%'; loadStatus.textContent='Loading face detection model…';

            /* Load FaceMesh script first (needed before initFaceMesh call) */
            await new Promise(resolve=>{
                if (typeof FaceMesh!=='undefined'){resolve();return;}
                const s=document.createElement('script');
                s.src='https://unpkg.com/@mediapipe/face_mesh@0.4.1633559619/face_mesh.js';
                s.crossOrigin='anonymous'; s.onload=resolve; s.onerror=resolve;
                document.head.appendChild(s);
            });

            /* Request camera permission — only blocking step */
            loadBar.style.width='40%'; loadStatus.textContent='Requesting camera access…';
            let camErr=null;
            await navigator.mediaDevices.getUserMedia({
                video:isMobile?{facingMode:{ideal:'user'},width:640,height:480}:{width:640,height:480},
                audio:true
            }).then(s=>{stream=s;}).catch(e=>{camErr=e;});

            if (camErr) {
                const map={
                    NotAllowedError:['Camera access denied','Allow camera and microphone access in your browser settings, then try again.'],
                    NotFoundError:['No camera found','This device doesn\'t appear to have a camera.'],
                    NotSupportedError:['Browser not supported','Please use Chrome or Safari.'],
                };
                const [t,m]=map[camErr.name]||['Camera error','Could not access your camera. '+camErr.message];
                errH.textContent=t; errMsg.textContent=m; showScreen('error'); return;
            }

            loadBar.style.width='85%'; loadStatus.textContent='Starting sensors…';
            videoEl.srcObject=stream;
            const audioTrack=stream.getAudioTracks()[0];
            if (audioTrack) setupAudio(audioTrack);
            initFaceMesh();
            /* Load MediaPipe Pose for shoulder-based breath rate (lazy, best-effort) */
            if (typeof Pose==='undefined') {
                const ps=document.createElement('script');
                ps.src='https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js';
                ps.crossOrigin='anonymous'; ps.onload=()=>initPose(); ps.onerror=()=>{};
                document.head.appendChild(ps);
            } else { initPose(); }
            /* Load neural rPPG in background — does NOT block demo startup.
               POS fallback runs immediately; neural path activates once model is ready. */
            if (!nnReady&&!nnFailed) {
                loadNeuralRPPG().catch(()=>{nnFailed=true;});
            }
            loadBar.style.width='100%';
            await new Promise(r=>setTimeout(r,300));

            /* Reset session state (NN sessions survive — expensive to reload) */
            frameCount=0; startTime=null; hrLastGood=null; hrLastGoodAt=0; hrLastDispAt=0; hrMode='face';
            rgbBuf=[]; lastBR=null; faceRoi=null;
            brHpPrev=0; brHpOut=0; brLpOut=0; brPrevFilt=null;
            brBreathTimes=[]; brLastPeakAt=0; brBreathStart=0;
            poseShoulderActive=false; poseTick=0; posePending=false;
            blinkTimes.length=0; earCalibBuf=[]; earCalibDone=false;
            blinkStart=null; prevEAR=null; lastDistCm=null; distUpdAt=0;
            coughCooldown=0; ambientRMS=null; ambientN=0; voiceReady=false;
            fmTick=0; fmPending=false;
            nnBvpBuf=[]; nnLastTs=null; nnFrameTs=[]; nnHrCache=null; nnHrCacheAt=0; nnRunning=false;
            if (nnReady&&nnStateData) nnState=buildNNState(); /* fresh state for new session */
            hrKalman.reset(); brKalman.reset();
            Object.keys(valStates).forEach(k=>delete valStates[k]);

            showScreen('running');
            buildCards(); initFaceCanvas(); initNNCanvas(); revealCards();
            METRICS.forEach(m=>{
                if (m.warmupSec>0) runWarmup(m.id,m.warmupSec);
                else setQuality(m.id,'good');
            });
            renderLoop();
        }

        function closeDemo() {
            if (animRaf) { cancelAnimationFrame(animRaf); animRaf=null; }
            Object.values(warmupTimers).forEach(cancelAnimationFrame);
            if (stream) { stream.getTracks().forEach(t=>t.stop()); stream=null; }
            if (fingerStream) { fingerStream.getTracks().forEach(t=>t.stop()); fingerStream=null; }
            if (audioCtx) { try{audioCtx.close();}catch(e){} audioCtx=null; analyserAudio=null; }
            if (faceMesh) { try{faceMesh.close();}catch(e){} faceMesh=null; }
            if (poseModel) { try{poseModel.close();}catch(e){} poseModel=null; }
            videoEl.srcObject=null;
            overlay.classList.remove('demo-open');
            document.body.style.overflow='';
        }

        openBtn.addEventListener('click', openDemo);
        closeBtn.addEventListener('click', closeDemo);
        allowBtn.addEventListener('click', startCamera);
        cancelLink.addEventListener('click', e=>{ e.preventDefault(); closeDemo(); });
        errClose.addEventListener('click', closeDemo);
        pilotLink.addEventListener('click', closeDemo);
        document.addEventListener('keydown', e=>{
            if (e.key==='Escape'&&overlay.classList.contains('demo-open')) closeDemo();
        });
    })();
