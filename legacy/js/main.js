    (function() {
        const t = document.documentElement,
            k = 'theme';
        let v = localStorage.getItem(k) || 'dark';
        t.setAttribute('data-theme', v);
        const btn = document.getElementById('themeToggle');
        if (btn) {
            btn.textContent = v === 'dark' ? '☀' : '☽';
            btn.addEventListener('click', function() {
                const r = this.getBoundingClientRect();
                window.dispatchEvent(new CustomEvent('cursorMove', {
                    detail: {
                        x: r.left + r.width / 2,
                        y: r.top + r.height / 2
                    }
                }));
                v = v === 'dark' ? 'light' : 'dark';
                t.setAttribute('data-theme', v);
                localStorage.setItem(k, v);
                btn.textContent = v === 'dark' ? '☀' : '☽'
            })
        }
    })();
    gsap.registerPlugin(ScrollTrigger);
    (function() {
        const loader = document.getElementById('loader'),
            dot = document.getElementById('ldot'),
            logo = document.getElementById('llogo'),
            bar = document.getElementById('lbar');
        document.body.style.overflow = 'hidden';
        const tl = gsap.timeline({
            onComplete: () => {
                gsap.to(loader, {
                    opacity: 0,
                    duration: .55,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        loader.style.display = 'none';
                        document.body.style.overflow = '';
                        startHero();
                    }
                });
            }
        });
        tl.to(dot, {
            scale: 1,
            duration: .3,
            ease: 'back.out(2)'
        }).to(dot, {
            scale: 80,
            opacity: 0,
            duration: .75,
            ease: 'expo.in'
        }, '.3').to(logo, {
            opacity: 1,
            duration: .5,
            ease: 'power2.out'
        }, '.7').to(bar, {
            width: '100%',
            duration: .7,
            ease: 'power2.inOut'
        }, '1.0').to({}, {
            duration: .15
        });
    })();
    const cur = document.getElementById('cur'),
        curR = document.getElementById('cur-r');
    let mx = 0,
        my = 0,
        rx = 0,
        ry = 0;
    document.addEventListener('mousemove', e => {
        mx = e.clientX;
        my = e.clientY;
        cur.style.left = mx + 'px';
        cur.style.top = my + 'px'
    });
    window.addEventListener('cursorMove', e => {
        mx = e.detail.x;
        my = e.detail.y;
        rx = mx;
        ry = my;
        cur.style.left = mx + 'px';
        cur.style.top = my + 'px';
        curR.style.left = rx + 'px';
        curR.style.top = ry + 'px'
    });
    (function loop() {
        rx += (mx - rx) * .2;
        ry += (my - ry) * .2;
        curR.style.left = rx + 'px';
        curR.style.top = ry + 'px';
        requestAnimationFrame(loop)
    })();
    document.querySelectorAll('a,button,input').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('h'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('h'));
    });
    window.addEventListener('scroll', () => document.getElementById('nav').classList.toggle('sc', scrollY > 60));
    (function() {
        const ham = document.getElementById('navHam'),
            drawer = document.getElementById('navDrawer');
        if (ham && drawer) {
            ham.addEventListener('click', () => {
                ham.classList.toggle('open');
                drawer.classList.toggle('open')
            });
            drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
                ham.classList.remove('open');
                drawer.classList.remove('open')
            }))
        }
    })();
    (function() {
        const cv = document.getElementById('s1cv'),
            ctx = cv.getContext('2d');
        let W,
            H,
            pts = [];
        function resize() {
            W = cv.width = cv.offsetWidth;
            H = cv.height = cv.offsetHeight
        }
        resize();
        window.addEventListener('resize', resize);
        function Pt() {
            this.x = Math.random() * 1000;
            this.y = Math.random() * 700;
            this.vx = (Math.random() - .5) * .22;
            this.vy = (Math.random() - .5) * .22;
            this.r = Math.random() * 1.1 + .3;
            this.a = Math.random() * .3 + .05
        }
        Pt.prototype.tick = function() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) {
                this.x = Math.random() * W;
                this.y = Math.random() * H
            }
        };
        for (let i = 0; i < 80; i++)
            pts.push(new Pt());
        let sw = 0;
        function frame() {
            ctx.clearRect(0, 0, W, H);
            const g = ctx.createRadialGradient(W / 2, H * .52, 0, W / 2, H * .52, W * .58);
            g.addColorStop(0, 'rgba(0,191,165,.08)');
            g.addColorStop(1, 'rgba(0,191,165,0)');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, W, H);
            pts.forEach(p => {
                p.tick();
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0,191,165,${p.a})`;
                ctx.fill()
            });
            for (let i = 0; i < pts.length; i++)
                for (let j = i + 1; j < pts.length; j++) {
                    const dx = pts[i].x - pts[j].x,
                        dy = pts[i].y - pts[j].y,
                        d = Math.hypot(dx, dy);
                    if (d < 100) {
                        ctx.beginPath();
                        ctx.moveTo(pts[i].x, pts[i].y);
                        ctx.lineTo(pts[j].x, pts[j].y);
                        ctx.strokeStyle = `rgba(0,191,165,${.06 * (1 - d / 100)})`;
                        ctx.lineWidth = .5;
                        ctx.stroke()
                    }
                }
            sw += .003;
            const cx = W / 2,
                cy = H / 2,
                mr = Math.min(W, H) * .4;
            for (let k = 1; k <= 4; k++) {
                ctx.beginPath();
                ctx.arc(cx, cy, mr * k / 4, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(0,191,165,.06)';
                ctx.lineWidth = 1;
                ctx.stroke()
            }
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(sw);
            const sg = ctx.createLinearGradient(0, 0, mr, 0);
            sg.addColorStop(0, 'rgba(0,191,165,.1)');
            sg.addColorStop(1, 'rgba(0,191,165,0)');
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, mr, -.32, .32);
            ctx.closePath();
            ctx.fillStyle = sg;
            ctx.fill();
            ctx.restore();
            requestAnimationFrame(frame);
        }
        frame();
    })();
    const heroPhrases = [{
        w1: 'The First Warning.',
        w2: 'Before',
        w3: 'the Last.',
        em: 0
    }, {
        w1: 'Weeks',
        w2: 'Before',
        w3: 'the Crisis.',
        em: 0
    }, {
        w1: 'Zero wearables.',
        w2: 'Zero',
        w3: 'hassle.',
        em: 0
    }, {
        w1: 'Designed for',
        w2: 'the Forgotten',
        w3: 'Risk.',
        em: 0
    }];
    function startHero() {
        setTimeout(() => {
            const e = document.getElementById('s1ey');
            if (e) {
                e.style.transition = 'opacity .8s';
                e.style.opacity = 1
            }
        }, 200);
        ['h1', 'h2', 'h3'].forEach((id, i) => {
            setTimeout(() => {
                const e = document.getElementById(id);
                e.style.transition = 'transform .95s cubic-bezier(.16,1,.3,1),opacity .95s';
                e.style.transform = 'translateY(0)';
                e.style.opacity = 1
            }, 450 + i * 160)
        });
        setTimeout(() => {
            const s = document.getElementById('s1sub');
            s.style.transition = 'opacity .7s,transform .7s';
            s.style.opacity = 1;
            s.style.transform = 'translateY(0)'
        }, 950);
        setTimeout(() => {
            const c = document.getElementById('s1acts');
            c.style.transition = 'opacity .7s,transform .7s';
            c.style.opacity = 1;
            c.style.transform = 'translateY(0)';
            const sc = document.getElementById('s1sc');
            sc.style.transition = 'opacity .7s';
            sc.style.opacity = 1;
            startHeroCycle()
        }, 1250);
    }
    function startHeroCycle() {
        let idx = 0;
        const h1 = document.getElementById('h1'),
            h2 = document.getElementById('h2'),
            h3 = document.getElementById('h3');
        if (!h1 || !h2 || !h3)
            return;
        function setPhrase(i) {
            const p = heroPhrases[i];
            h1.innerHTML = p.em === 0 ? '<em>' + p.w1 + '</em>' : p.w1;
            h2.textContent = p.w2;
            h3.textContent = p.w3
        }
        function cycle() {
            idx = (idx + 1) % heroPhrases.length;
            gsap.to([h1, h2, h3], {
                y: -12,
                opacity: 0,
                duration: .4,
                ease: 'power2.in'
            });
            setTimeout(() => {
                setPhrase(idx);
                gsap.fromTo([h1, h2, h3], {
                    y: 16,
                    opacity: 0
                }, {
                    y: 0,
                    opacity: 1,
                    duration: .55,
                    ease: 'power2.out'
                })
            }, 420)
        }
        setInterval(cycle, 2400)
    }
    (function() {
        const bar = document.getElementById('scroll-progress'),
            s9 = document.getElementById('s9');
        function update() {
            if (!s9 || !bar)
                return;
            const s9Top = s9.getBoundingClientRect().top + window.scrollY;
            const pct = Math.min(100, Math.max(0, (window.scrollY / s9Top) * 100));
            bar.style.width = pct + '%'
        }
        window.addEventListener('scroll', update, {
            passive: true
        });
        update();
    })();
    /* Build 1000-dot grid (50 × 20) lazily once */
    (function buildDotGrid() {
        const grid = document.getElementById('s2grid');
        if (!grid || grid.dataset.built) return;
        const frag = document.createDocumentFragment();
        for (let i = 0; i < 1000; i++) {
            const d = document.createElement('div');
            d.className = 's2-dot';
            frag.appendChild(d);
        }
        grid.appendChild(frag);
        grid.dataset.built = '1';
    })();

    const s2obs = new IntersectionObserver(es => {
        if (es[0].isIntersecting) {
            document.querySelectorAll('#s2 .rv').forEach((e, i) => setTimeout(() => e.classList.add('on'), i * 110));
            const el = document.getElementById('s2n');
            const cmpEl = document.getElementById('s2cmp');
            const gridCount = document.getElementById('s2gridcount');
            const dots = document.querySelectorAll('#s2grid .s2-dot');
            const st = performance.now();
            const dur = 2400;
            const dangerThreshold = 667; // ≈1-in-3 die — tail dots redshift
            (function f(now) {
                const t = Math.min((now - st) / dur, 1);
                const ease = 1 - Math.pow(1 - t, 3);
                const value = ease * 1.0;
                el.textContent = t < 1 ? value.toFixed(1) : '1.0';
                const lit = Math.floor(ease * dots.length);
                if (gridCount) gridCount.textContent = `${lit.toLocaleString()} / 1,000`;
                for (let i = 0; i < dots.length; i++) {
                    if (i < lit && !dots[i].classList.contains('on')) {
                        dots[i].classList.add('on');
                        if (i >= dangerThreshold) dots[i].classList.add('danger');
                    }
                }
                if (t < 1) requestAnimationFrame(f);
                else {
                    el.textContent = '1.0';
                    if (gridCount) gridCount.textContent = '1,000 / 1,000';
                }
            })(st);
            /* Subtle comparable cycle to drive home scale */
            if (cmpEl) {
                const comparables = [
                    '≈ everyone in the city of Austin, Texas',
                    '≈ population of San Jose, California',
                    '≈ every adult in Toronto and Hamilton',
                ];
                let idx = 0;
                cmpEl.style.transition = 'opacity .25s ease';
                setInterval(() => {
                    idx = (idx + 1) % comparables.length;
                    cmpEl.style.opacity = '0';
                    setTimeout(() => {
                        cmpEl.textContent = comparables[idx];
                        cmpEl.style.opacity = '1';
                    }, 240);
                }, 4200);
            }
            s2obs.disconnect();
        }
    }, {
        threshold: .25
    });
    s2obs.observe(document.getElementById('s2'));
    (function() {
        const sec = document.getElementById('s3'),
            ws = document.querySelectorAll('#s3tx .w'),
            bg = document.getElementById('s3bg'),
            pr = document.getElementById('s3pr'),
            hud = document.getElementById('s3hud'),
            bpmEl = document.getElementById('s3bpm'),
            spo2El = document.getElementById('s3spo2'),
            riskEl = document.getElementById('s3risk'),
            hudPath = document.getElementById('s3hudpath'),
            tl = document.getElementById('s3tl'),
            tlFill = document.getElementById('s3tlfill'),
            tlMarkers = document.querySelectorAll('.s3-tl-marker'),
            ns = ['—', '01', '02', '03'];
        let pneumoniaFired = false;
        const lastIdx = ws.length - 1;

        function lerp(a, b, t) { return a + (b - a) * t; }

        function buildWavePath(amp, freq) {
            const W = 200, H = 40, mid = H / 2;
            let d = `M0 ${mid}`;
            const segs = 24;
            for (let i = 1; i <= segs; i++) {
                const t = i / segs;
                const x = t * W;
                const y = mid + Math.sin(t * Math.PI * freq) * amp;
                d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
            }
            return d;
        }

        window.addEventListener('scroll', () => {
            const r = sec.getBoundingClientRect();
            const p = Math.max(0, Math.min(1, -r.top / (r.height - innerHeight)));
            const lit = Math.floor(p * (ws.length + 4));
            ws.forEach((w, i) => i < lit ? w.classList.add('on') : w.classList.remove('on'));
            bg.textContent = ns[Math.min(3, Math.floor(p * 4))];
            bg.style.opacity = .02 + p * .04;
            pr.textContent = `scroll to reveal · ${Math.round(p * 100)}%`

            // HUD show/hide based on whether s3 is in viewport
            const inView = r.top < innerHeight && r.bottom > 0;
            if (hud) hud.classList.toggle('on', inView && p > 0.02);
            if (tl)  tl.classList.toggle('on',  inView && p > 0.02);

            // Vital signs progression
            const bpm = Math.round(lerp(12, 30, p));
            const spo2 = Math.round(lerp(98, 88, p));
            const risk = p < 0.33 ? 'low' : p < 0.7 ? 'rising' : 'critical';
            if (bpmEl)  bpmEl.textContent = String(bpm);
            if (spo2El) spo2El.textContent = String(spo2);
            if (riskEl) riskEl.textContent = risk;
            if (hud) hud.classList.toggle('alarm', p > 0.6);
            // animate the wave path: amplitude grows + frequency rises
            if (hudPath) {
                const amp = lerp(5, 13, p);
                const freq = lerp(4, 9, p);
                hudPath.setAttribute('d', buildWavePath(amp, freq));
                hudPath.setAttribute('stroke', p > 0.6 ? '#FF4530' : '#00E5C8');
            }

            // Timeline ribbon fill
            if (tlFill) tlFill.style.height = (p * 100) + '%';
            tlMarkers.forEach(m => {
                const mp = parseFloat(m.style.getPropertyValue('--p')) || 0;
                m.classList.toggle('reached', p >= mp - 0.01);
                if (mp >= 0.7) m.classList.toggle('danger', p >= mp - 0.01);
            });

            // Fire breath spike + screen shake when "Pneumonia" word reveals
            if (!pneumoniaFired && lit > lastIdx) {
                pneumoniaFired = true;
                if (typeof window.AEYRON_BREATH_SPIKE === 'function') window.AEYRON_BREATH_SPIKE();
            }
            if (p < 0.5) pneumoniaFired = false;
        });

        // 3D parallax tilt on giant bg numbers, driven by cursor
        if (bg && sec) {
            sec.addEventListener('mousemove', (e) => {
                const r = sec.getBoundingClientRect();
                const nx = (e.clientX - r.left) / r.width - 0.5;
                const ny = (e.clientY - r.top)  / r.height - 0.5;
                const rotY = nx * 12;
                const rotX = -ny * 10;
                bg.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(0)`;
            });
            sec.addEventListener('mouseleave', () => {
                bg.style.transform = 'perspective(1200px) rotateX(0) rotateY(0)';
            });
        }
    })();
    function countUp(el) {
        const t = parseInt(el.dataset.t),
            st = performance.now();
        (function f(now) {
            const p = Math.min((now - st) / 1400, 1),
                e = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(e * t);
            if (p < 1)
                requestAnimationFrame(f)
        })(st)
    }
    const s4obs = new IntersectionObserver(es => {
        es.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('on');
                e.target.querySelectorAll('.cu').forEach(c => countUp(c));
                s4obs.unobserve(e.target)
            }
        })
    }, {
        threshold: .2
    });
    document.querySelectorAll('.s4-card').forEach((c, i) => {
        c.style.transitionDelay = (i * .1) + 's';
        s4obs.observe(c)
    });
    const rvo = new IntersectionObserver(es => {
        es.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('on');
                rvo.unobserve(e.target)
            }
        })
    }, {
        threshold: .1
    });
    document.querySelectorAll('.rv').forEach(e => rvo.observe(e));
    const s8obs = new IntersectionObserver(es => {
        es.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('on');
                s8obs.unobserve(e.target)
            }
        })
    }, {
        threshold: .15
    });
    document.querySelectorAll('.s8-card').forEach((c, i) => {
        c.style.transitionDelay = (i * .12) + 's';
        s8obs.observe(c)
    });
    const roiObs = new IntersectionObserver(es => {
        es.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('on');
                roiObs.unobserve(e.target)
            }
        })
    }, {
        threshold: .15
    });
    document.querySelectorAll('.roi-card.rv').forEach((c, i) => {
        c.style.transitionDelay = (i * .12) + 's';
        roiObs.observe(c)
    });
    const s7obs = new IntersectionObserver(es => {
        es.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('on');
                s7obs.unobserve(e.target)
            }
        })
    }, {
        threshold: .2
    });
    document.querySelectorAll('.s7-step').forEach((s, i) => {
        s.style.transitionDelay = (i * .13) + 's';
        s7obs.observe(s)
    });
    const roadmapObs = new IntersectionObserver(es => {
        es.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('on');
                roadmapObs.unobserve(e.target)
            }
        })
    }, {
        threshold: .15
    });
    document.querySelectorAll('.roadmap-phase.rv').forEach((p, i) => {
        p.style.transitionDelay = (i * .14) + 's';
        roadmapObs.observe(p)
    });
    document.querySelectorAll('.steam-logo-item.rv').forEach((el, i) => {
        el.style.transitionDelay = (i * .08) + 's'
    });
    document.querySelectorAll('.sf-card.rv').forEach((el, i) => {
        el.style.transitionDelay = (i * .1) + 's'
    });
    document.querySelectorAll('.plat-shot.rv').forEach((el, i) => {
        el.style.transitionDelay = (i * .08) + 's'
    });
    (function() {
        const cv = document.getElementById('wcv');
        if (!cv)
            return;
        const ctx = cv.getContext('2d'),
            W = cv.width,
            H = cv.height;
        let t = 0,
            pts2 = [];
        for (let i = 0; i < W; i++)
            pts2.push(H / 2);
        const rrE = document.getElementById('rrv'),
            hrE = document.getElementById('hrv');
        function draw() {
            t += .028;
            const v = Math.sin(t) * 20 + Math.sin(t * .98) * .6 * (H * .38);
            pts2.push(H / 2 - v + (Math.random() - .5) * 1.5);
            if (pts2.length > W)
                pts2.shift();
            ctx.clearRect(0, 0, W, H);
            for (let x = 0; x < W; x += 26) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, H);
                ctx.strokeStyle = 'rgba(0,191,165,.05)';
                ctx.lineWidth = 1;
                ctx.stroke()
            }
            ctx.beginPath();
            ctx.moveTo(0, H / 2);
            ctx.lineTo(W, H / 2);
            ctx.strokeStyle = 'rgba(0,191,165,.1)';
            ctx.lineWidth = 1;
            ctx.stroke();
            const gr = ctx.createLinearGradient(0, 0, 0, H);
            gr.addColorStop(0, 'rgba(0,229,200,.9)');
            gr.addColorStop(1, 'rgba(0,191,165,.3)');
            ctx.beginPath();
            pts2.forEach((y, i) => i === 0 ? ctx.moveTo(i, y) : ctx.lineTo(i, y));
            ctx.strokeStyle = gr;
            ctx.lineWidth = 1.5;
            ctx.lineJoin = 'round';
            ctx.stroke();
            const lx = pts2.length - 1,
                ly = pts2[pts2.length - 1];
            ctx.beginPath();
            ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = 'var(--teal-hi)';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(lx, ly, 6, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,229,200,.2)';
            ctx.fill();
            if (Math.random() < .007 && rrE)
                rrE.textContent = 14 + Math.floor(Math.random() * 7);
            if (Math.random() < .004 && hrE)
                hrE.textContent = 62 + Math.floor(Math.random() * 13);
            requestAnimationFrame(draw)
        }
        draw();
    })();
    (function() {
        const sec = document.getElementById('s6'),
            slides = document.querySelectorAll('.s6-slide'),
            dots = document.querySelectorAll('.s6-dot'),
            anns = [document.getElementById('a1'), document.getElementById('a2'), document.getElementById('a3'), document.getElementById('a4'), document.getElementById('a5'), document.getElementById('a6')];
        let current = 0,
            annotsOn = false;
        function syncAnns(slideIdx) {
            anns.forEach(a => {
                if (!a) return;
                const target = parseInt(a.dataset.slide, 10);
                a.classList.toggle('lit', target === slideIdx);
            });
        }
        function go(idx) {
            if (idx === current)
                return;
            slides[current].classList.remove('act');
            slides[current].classList.add('prv');
            const prev = current;
            setTimeout(() => slides[prev] && slides[prev].classList.remove('prv'), 600);
            dots[current].classList.remove('act');
            current = idx;
            slides[current].classList.add('act');
            dots[current].classList.add('act');
            syncAnns(idx);
        }
        const aObs = new IntersectionObserver(es => {
            if (es[0].isIntersecting && !annotsOn) {
                annotsOn = true;
                anns.forEach((a, i) => a && setTimeout(() => a.classList.add('vis'), 350 + i * 140));
                setTimeout(() => syncAnns(current), 350 + anns.length * 140);
                aObs.disconnect()
            }
        }, {
            threshold: .15
        });
        aObs.observe(sec);
        ScrollTrigger.create({
            trigger: sec,
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: self => {
                go(Math.min(slides.length - 1, Math.floor(self.progress * slides.length)))
            }
        });
        dots.forEach(d => d.addEventListener('click', () => go(parseInt(d.dataset.i))));
        /* Click-to-jump on annotations */
        anns.forEach(a => {
            if (!a) return;
            a.style.cursor = 'pointer';
            a.addEventListener('click', () => {
                const target = parseInt(a.dataset.slide, 10);
                if (!Number.isNaN(target)) {
                    /* scroll to s6 then go(target) — let scroll-trigger settle */
                    const r = sec.getBoundingClientRect();
                    const scrollEnd = window.scrollY + r.top + (sec.offsetHeight / slides.length) * target;
                    window.scrollTo({ top: scrollEnd, behavior: 'smooth' });
                }
            });
        });
        let ss = 0;
        setInterval(() => {
            ss++;
            const h = String(Math.floor(ss / 3600)).padStart(2, '0'),
                m = String(Math.floor((ss % 3600) / 60)).padStart(2, '0'),
                s = String(ss % 60).padStart(2, '0');
            const el = document.getElementById('hud-up');
            if (el)
                el.textContent = `${h}:${m}:${s}`;
            if (ss % 7 === 0) {
                const e = document.getElementById('hud-rr');
                if (e)
                    e.textContent = (14 + Math.floor(Math.random() * 6)) + ' bpm'
            }
        }, 1000);
    })();
    ScrollTrigger.create({
        trigger: '#s7',
        start: 'top center',
        end: 'bottom center',
        onUpdate: self => {
            const e = document.getElementById('s7lf');
            if (e)
                e.style.height = (self.progress * 100) + '%'
        }
    });
    (function() {
        const i = document.getElementById('wlin'),
            b = document.getElementById('wlbtn');
        let db = null;
        async function initFirebase() {
            if (db)
                return db;
            const r = await fetch('/api/firebase-config');
            const cfg = await r.json();
            if (cfg.error || !cfg.apiKey) {
                console.warn('Firebase not configured');
                return null
            }
            if (!firebase.apps.length)
                firebase.initializeApp(cfg);
            db = firebase.firestore();
            return db
        }
        function showSuccess() {
            b.textContent = "You're in ✓";
            b.style.background = 'var(--green)';
            b.style.color = '#fff';
            b.style.boxShadow = 'none';
            b.disabled = true;
            i.value = '';
            i.placeholder = "Thank you — we'll be in touch."
        }
        function showErr() {
            i.style.borderColor = 'rgba(255,36,0,.55)';
            setTimeout(() => i.style.borderColor = 'rgba(0,191,165,.2)', 1500)
        }
        b.addEventListener('click', async () => {
            const email = (i.value || '').trim();
            if (!email || !email.includes('@')) {
                showErr();
                return
            }
            b.textContent = 'Submitting…';
            b.disabled = true;
            try {
                const firestore = await initFirebase();
                if (firestore) {
                    await firestore.collection('waitlist').add({
                        email,
                        source: 'landing',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    })
                }
            } catch (e) {
                console.error('Waitlist submit:', e)
            }
            showSuccess()
        })
    })();

/* ── PHASE 7: Guardian column sweep + s9 count-up resolution ─── */
(function () {
    /* Guardian: add .swept class on enter so CSS staggers AEYRON cells */
    const guardian = document.getElementById('s-guardian');
    if (guardian) {
        new IntersectionObserver(([e]) => {
            if (e.isIntersecting) {
                guardian.classList.add('swept');
            }
        }, { threshold: 0.25 }).observe(guardian);
    }

    /* s9: count up 0 → 14 then snap to "10–14" */
    const s9 = document.getElementById('s9');
    const wkEl = document.getElementById('s9-weeks');
    if (s9 && wkEl) {
        let fired = false;
        new IntersectionObserver(([e]) => {
            if (!fired && e.isIntersecting) {
                fired = true;
                const start = performance.now();
                const dur = 1600;
                (function tick(now) {
                    const p = Math.min((now - start) / dur, 1);
                    const eased = 1 - Math.pow(1 - p, 3);
                    const v = Math.round(eased * 14);
                    wkEl.textContent = String(v);
                    if (p < 1) requestAnimationFrame(tick);
                    else setTimeout(() => { wkEl.textContent = '10–14'; }, 500);
                })(start);
            }
        }, { threshold: 0.35 }).observe(s9);
    }
})();

/* ── HOTFIX: hide residual cursor when mouse leaves window ──── */
(function () {
    document.addEventListener('mouseenter', () => document.body.classList.add('has-cursor'));
    document.addEventListener('mouseleave', () => document.body.classList.remove('has-cursor'));
    // start active so cursor visible on load
    document.body.classList.add('has-cursor');
})();

/* ── S4 ITERATION: trigger dial fill + 3D mouse tilt on cards ── */
(function () {
    const cards = document.querySelectorAll('#s4 .s4-card');
    if (!cards.length) return;

    /* On card enter view, add .lit so the SVG dial fills */
    new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('lit');
            }
        });
    }, { threshold: 0.4 }).observe(document.getElementById('s4'));

    /* Cursor parallax tilt on each card */
    cards.forEach(card => {
        let raf = null, tX = 0, tY = 0;
        const onMove = (ev) => {
            const r = card.getBoundingClientRect();
            const nx = (ev.clientX - r.left) / r.width - 0.5;
            const ny = (ev.clientY - r.top)  / r.height - 0.5;
            tX = -ny * 6;
            tY =  nx * 8;
            if (raf) return;
            raf = requestAnimationFrame(() => {
                card.style.transform =
                    `perspective(900px) rotateX(${tX.toFixed(2)}deg) rotateY(${tY.toFixed(2)}deg) translateZ(0)`;
                raf = null;
            });
        };
        const onLeave = () => {
            card.style.transform = 'perspective(900px) rotateX(0) rotateY(0)';
        };
        card.addEventListener('mousemove', onMove);
        card.addEventListener('mouseleave', onLeave);
    });
})();

/* ── S5 ITERATION: decline chart trigger (chain row removed per UX) ── */
(function () {
    const s5 = document.getElementById('s5');
    if (!s5) return;
    const decline = document.querySelector('.s5-decline');

    new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting && decline) {
                setTimeout(() => decline.classList.add('lit'), 200);
            }
        });
    }, { threshold: 0.25 }).observe(s5);
})();

/* ── S-GUARDIAN ITERATION: tooltips + total score count-up ── */
(function () {
    const sec = document.getElementById('s-guardian');
    if (!sec) return;

    /* Count-up the total ✓ in tfoot when section enters view */
    const scoreCells = sec.querySelectorAll('.g-score');
    let fired = false;
    new IntersectionObserver(([e]) => {
        if (!fired && e.isIntersecting) {
            fired = true;
            scoreCells.forEach((cell, i) => {
                const target = parseInt(cell.dataset.target, 10) || 0;
                const valEl = cell.querySelector('.g-score-v');
                const denomEl = cell.querySelector('.g-score-d');
                if (denomEl) denomEl.textContent = '/' + (target === 1 ? '5' : '5'); // /5 always
                const start = performance.now() + i * 220;
                const dur = 1100;
                (function tick(now) {
                    if (now < start) return requestAnimationFrame(tick);
                    const t = Math.min((now - start) / dur, 1);
                    const eased = 1 - Math.pow(1 - t, 3);
                    valEl.textContent = String(Math.round(eased * target));
                    if (t < 1) requestAnimationFrame(tick);
                })(performance.now());
            });
        }
    }, { threshold: 0.3 }).observe(sec);

    /* Single shared tooltip */
    const tip = document.getElementById('g-tooltip');
    if (!tip) return;
    const targets = sec.querySelectorAll('[data-tip]');
    targets.forEach(el => {
        el.addEventListener('mouseenter', (e) => {
            tip.textContent = el.dataset.tip;
            tip.classList.add('on');
            const r = el.getBoundingClientRect();
            const tipR = tip.getBoundingClientRect();
            tip.style.left = `${r.left + r.width / 2 - tipR.width / 2}px`;
            tip.style.top = `${r.top - tipR.height - 12}px`;
        });
        el.addEventListener('mouseleave', () => tip.classList.remove('on'));
    });
})();

/* ── S7 ITERATION: active step + temporal arc sync ── */
(function () {
    const sec = document.getElementById('s7');
    if (!sec) return;
    const steps = sec.querySelectorAll('.s7-step');
    const txItems = sec.querySelectorAll('.s7-tx');

    function setActive(idx) {
        steps.forEach((s, i) => s.classList.toggle('active', i === idx));
        txItems.forEach((t, i) => t.classList.toggle('lit', i === idx));
    }

    /* On scroll within the section, find the step closest to viewport center */
    function onScroll() {
        const r = sec.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const center = innerHeight * 0.45;
        let bestIdx = 0;
        let bestDist = Infinity;
        steps.forEach((s, i) => {
            const sr = s.getBoundingClientRect();
            const mid = sr.top + sr.height / 2;
            const d = Math.abs(mid - center);
            if (d < bestDist) { bestDist = d; bestIdx = i; }
        });
        setActive(bestIdx);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();

/* ── S-ROI ITERATION: card count-ups + interactive calculator ── */
(function () {
    const sec = document.getElementById('s-roi');
    if (!sec) return;

    /* Card mini-bar fill + stat count-ups when each card enters */
    const cards = sec.querySelectorAll('.roi-card');
    cards.forEach(c => {
        new IntersectionObserver(es => {
            es.forEach(e => {
                if (!e.isIntersecting || e.target.classList.contains('lit')) return;
                e.target.classList.add('lit');
                e.target.querySelectorAll('[data-cu]').forEach((el, i) => {
                    const target = parseFloat(el.dataset.target) || 0;
                    const start = performance.now() + i * 120;
                    const dur = 1300;
                    (function tick(now) {
                        if (now < start) return requestAnimationFrame(tick);
                        const t = Math.min((now - start) / dur, 1);
                        const eased = 1 - Math.pow(1 - t, 3);
                        el.textContent = String(Math.round(eased * target));
                        if (t < 1) requestAnimationFrame(tick);
                        else el.textContent = String(target);
                    })(performance.now());
                });
            });
        }, { threshold: 0.35 }).observe(c);
    });

    /* ROI Calculator */
    const slider = document.getElementById('roi-slider');
    const resEl = document.getElementById('roi-residents');
    const savEl = document.getElementById('roi-savings');
    const avoidEl = document.getElementById('roi-avoided');
    const hrsEl = document.getElementById('roi-nursehrs');
    const multEl = document.getElementById('roi-multiple');
    if (!slider || !savEl) return;

    const fmt = (n) => Math.round(n).toLocaleString('en-US');

    function recalc() {
        const residents = parseInt(slider.value, 10);
        // Heuristics: 4 transfers/yr without → 1 with ⇒ 3 avoided × 30% applies (assume 30% of residents are PD-stage 2-4)
        const eligible = Math.max(1, Math.round(residents * 0.30));
        const avoided = eligible * 3;
        const savings = avoided * 15000;
        // Nurse hours: 22 hrs/wk reclaimed scales linearly with residents (baseline 80 res = 22hrs)
        const nurseHrs = Math.round((residents / 80) * 22 * 52);
        // Cost of Respira: $160/unit/mo × residents × 12
        const cost = residents * 160 * 12;
        const multiple = Math.max(0, savings / Math.max(1, cost));

        if (resEl)   resEl.textContent = String(residents);
        if (savEl)   savEl.textContent = fmt(savings);
        if (avoidEl) avoidEl.textContent = String(avoided);
        if (hrsEl)   hrsEl.textContent = fmt(nurseHrs);
        if (multEl)  multEl.textContent = multiple.toFixed(1) + '×';
    }
    slider.addEventListener('input', recalc);
    recalc();
})();

/* ── S-PRIVACY ITERATION: wire shared tooltip to privacy badges ── */
(function () {
    const tip = document.getElementById('g-tooltip');
    if (!tip) return;
    const targets = document.querySelectorAll('#s-privacy [data-tip]');
    targets.forEach(el => {
        el.addEventListener('mouseenter', () => {
            tip.textContent = el.dataset.tip;
            tip.classList.add('on');
            const r = el.getBoundingClientRect();
            const tipR = tip.getBoundingClientRect();
            tip.style.left = `${r.left + r.width / 2 - tipR.width / 2}px`;
            tip.style.top = `${r.top - tipR.height - 12}px`;
        });
        el.addEventListener('mouseleave', () => tip.classList.remove('on'));
    });
})();

/* ── S-PLATFORM dashboard: trend draw + live vitals ticking ── */
(function () {
    const dash = document.querySelector('#s-platform .dash');
    if (!dash) return;
    new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !dash.classList.contains('lit')) {
            dash.classList.add('lit');
        }
    }, { threshold: 0.25 }).observe(dash);

    /* Subtle live ticking on KPI numbers — within ±1 of base */
    const tick = (id, base, jitter) => {
        const el = document.getElementById(id);
        if (!el) return;
        setInterval(() => {
            const v = base + Math.round((Math.random() - 0.5) * jitter * 2);
            el.textContent = String(v);
        }, 1800 + Math.random() * 1400);
    };
    tick('dash-br', 22, 1);
    tick('dash-hr', 78, 2);
    tick('dash-vs', 62, 1);
    tick('dash-co', 14, 0);
})();

/* ── S-FOUNDERS: 3D mouse tilt on cards ──────────────────────── */
(function () {
    document.querySelectorAll('#s-founders [data-tilt]').forEach(card => {
        let raf = null;
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            const nx = (e.clientX - r.left) / r.width - 0.5;
            const ny = (e.clientY - r.top)  / r.height - 0.5;
            if (raf) return;
            raf = requestAnimationFrame(() => {
                card.style.transform = `perspective(900px) rotateX(${(-ny * 5).toFixed(2)}deg) rotateY(${(nx * 6).toFixed(2)}deg)`;
                raf = null;
            });
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(900px) rotateX(0) rotateY(0)';
        });
    });
})();

/* ── S-ROADMAP: ribbon fill + phase card tilt ────────────────── */
(function () {
    const sec = document.getElementById('s-roadmap');
    if (!sec) return;
    new IntersectionObserver(([e]) => {
        if (e.isIntersecting) sec.classList.add('lit');
    }, { threshold: 0.25 }).observe(sec);

    document.querySelectorAll('#s-roadmap [data-tilt]').forEach(card => {
        let raf = null;
        card.addEventListener('mousemove', (ev) => {
            const r = card.getBoundingClientRect();
            const nx = (ev.clientX - r.left) / r.width - 0.5;
            const ny = (ev.clientY - r.top) / r.height - 0.5;
            if (raf) return;
            raf = requestAnimationFrame(() => {
                card.style.transform = `perspective(900px) rotateX(${(-ny * 4).toFixed(2)}deg) rotateY(${(nx * 5).toFixed(2)}deg)`;
                raf = null;
            });
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(900px) rotateX(0) rotateY(0)';
        });
    });
})();
