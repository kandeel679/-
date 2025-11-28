document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    // Elements
    const phase1 = document.getElementById('phase-1');
    const phase2 = document.getElementById('phase-2');
    const riddleInput = document.getElementById('riddle-input');
    const hintBtn = document.getElementById('hint-btn');
    const hintTooltip = document.getElementById('hint-tooltip');
    
    // Cursor Elements
    const cursor = document.getElementById('cursor');
    const cursorDot = document.getElementById('cursor-dot');
    const hoverables = document.querySelectorAll('a, button, input');

    // Constants
    const CORRECT_ANSWER = 17;

    // --- Custom Cursor Logic ---
    if (window.matchMedia("(min-width: 768px)").matches) {
        window.addEventListener('mousemove', (e) => {
            gsap.to(cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1,
                ease: "power2.out"
            });
            gsap.to(cursorDot, {
                x: e.clientX,
                y: e.clientY,
                duration: 0,
            });
        });

        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                gsap.to(cursor, { scale: 2, borderColor: "rgba(255, 179, 71, 0.5)", duration: 0.3 });
                gsap.to(cursorDot, { scale: 0.5, backgroundColor: "#6b4c9a", duration: 0.3 });
            });
            el.addEventListener('mouseleave', () => {
                gsap.to(cursor, { scale: 1, borderColor: "#ffb347", duration: 0.3 });
                gsap.to(cursorDot, { scale: 1, backgroundColor: "#ffb347", duration: 0.3 });
            });
        });
    }

    // --- Parallax Effect ---
    window.addEventListener('mousemove', (e) => {
        const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
        const moveY = (e.clientY - window.innerHeight / 2) * 0.01;

        gsap.to('.floating', {
            x: (i, target) => {
                const speed = target.dataset.speed || 1;
                return moveX * speed * 10;
            },
            y: (i, target) => {
                const speed = target.dataset.speed || 1;
                return moveY * speed * 10;
            },
            duration: 1,
            ease: "power1.out"
        });
    });

    // Initial Animation
    gsap.from(phase1, {
        duration: 1.5,
        opacity: 0,
        y: 20,
        ease: "power2.out"
    });

    // Hint Logic
    hintBtn.addEventListener('click', () => {
        hintTooltip.classList.remove('hidden');
        setTimeout(() => {
            hintTooltip.classList.remove('opacity-0');
        }, 10);
    });

    // Riddle Logic
    riddleInput.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        if (value === CORRECT_ANSWER) unlockGate();
    });

    riddleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const value = parseInt(riddleInput.value);
            if (value === CORRECT_ANSWER) unlockGate();
            else shakeInput();
        }
    });

    function shakeInput() {
        riddleInput.classList.add('shake');
        setTimeout(() => { riddleInput.classList.remove('shake'); }, 500);
    }

    function unlockGate() {
        riddleInput.disabled = true;
        riddleInput.classList.add('border-warm-orange', 'text-warm-orange');
        
        const tl = gsap.timeline();

        tl.to(phase1, {
            duration: 1,
            opacity: 0,
            y: -20,
            ease: "power2.in",
            onComplete: () => {
                phase1.classList.add('hidden');
                phase2.classList.remove('hidden');
                
                // Enable scrolling
                document.body.classList.remove('overflow-hidden');
                document.body.classList.add('overflow-x-hidden');

                // Make sections visible for animation
                document.querySelectorAll('.story-section').forEach(el => el.classList.add('active'));
                
                // Refresh ScrollTrigger after layout changes
                ScrollTrigger.refresh();
                initScrollytelling();
            }
        })
        .to(phase2, {
            duration: 0.5,
            opacity: 1,
            ease: "power2.out"
        });
    }

    function initScrollytelling() {
        // --- Section 1: Poem (Pinned) ---
        const poemTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: "#section-poem",
                start: "top top",
                end: "+=150%", // Pin for 1.5 screen heights
                pin: true,
                scrub: 1,
                anticipatePin: 1
            }
        });

        // Animate lines one by one
        const poemLines = document.querySelectorAll('.poem-line');
        poemLines.forEach((line, i) => {
            gsap.set(line, { filter: "blur(10px)", opacity: 0, y: 20 }); // Initial state
            poemTimeline.to(line, {
                filter: "blur(0px)",
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power2.out"
            }, i * 0.8); // Stagger start times
        });

        // Fade out poem at the end of pin
        poemTimeline.to(".poem-container", { opacity: 0, duration: 0.5 }, "+=0.5");


        // --- Section 2: Letter (Parallax/Slide) ---
        gsap.to("#section-letter .parchment", {
            scrollTrigger: {
                trigger: "#section-letter",
                start: "top 80%",
                end: "top 20%",
                scrub: 1
            },
            y: 0,
            opacity: 1,
            ease: "power2.out"
        });

        // Stagger paragraphs inside letter
        gsap.utils.toArray('.letter-para').forEach((para, i) => {
            gsap.from(para, {
                scrollTrigger: {
                    trigger: para,
                    start: "top 90%",
                    toggleActions: "play none none reverse"
                },
                opacity: 0,
                y: 20,
                duration: 0.8,
                delay: i * 0.1
            });
        });


        // --- Section 3: Video (Scale Up) ---
        gsap.to(".video-container", {
            scrollTrigger: {
                trigger: "#section-video",
                start: "top center",
                end: "center center",
                scrub: 1
            },
            scale: 1,
            opacity: 1,
            ease: "power2.out"
        });
    }
});
