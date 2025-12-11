import { createApp, ref, reactive, onMounted, nextTick, watch } from 'vue';

const app = createApp({
    setup() {
        // --- State ---
        const totalCount = ref(1240); // Start with a base number
        const animatedCount = ref(1240);
        const accessLog = ref([]);
        const wishStack = ref([]);
        const isPulsing = ref(false);

        // --- Mock Data ---
        const mockDB = [
            { name: 'Luffy', dept: 'Captain', message: 'I want meat!' },
            { name: 'Zoro', dept: 'Combat', message: 'Where is the booze?' },
            { name: 'Nami', dept: 'Navigation', message: 'Bonus for everyone!' },
            { name: 'Usopp', dept: 'Sniper', message: 'I have 8000 followers!' },
            { name: 'Sanji', dept: 'Kitchen', message: 'Ladies first <3' },
            { name: 'Chopper', dept: 'Medical', message: 'Cotton candy please!' },
            { name: 'Robin', dept: 'Intel', message: 'History is fascinating.' },
            { name: 'Franky', dept: 'Engineering', message: 'SUPER!!!' },
            { name: 'Brook', dept: 'Music', message: 'May I see your panties?' },
            { name: 'Jinbe', dept: 'Helmsman', message: 'Honor above all.' },
            { name: 'Shanks', dept: 'Red Hair', message: 'Let\'s party!' },
            { name: 'Buggy', dept: 'Clown', message: 'I will be King!' },
            { name: 'Law', dept: 'Heart', message: 'Room.' },
            { name: 'Kid', dept: 'Magnet', message: 'Move over!' },
            { name: 'Killer', dept: 'Magnet', message: 'Fafafa!' },
            { name: 'Bege', dept: 'Fire Tank', message: 'Big family dinner.' },
            { name: 'Bonney', dept: 'Jewelry', message: 'Pizza time!' },
            { name: 'Drake', dept: 'Sword', message: 'Mission accepted.' },
            { name: 'Hawkins', dept: 'Magic', message: 'Cards say 99% success.' },
            { name: 'Apoo', dept: 'Music', message: 'Check it out!' },
            { name: 'Ace', dept: 'Spade', message: 'Thanks for loving me.' },
            { name: 'Sabo', dept: 'Rev', message: 'Dragon claw!' },
            { name: 'Koala', dept: 'Rev', message: 'Hack, stop it.' },
            { name: 'Dragon', dept: 'Rev', message: '...' },
            { name: 'Garp', dept: 'Marine', message: 'Fist of Love!' },
            { name: 'Koby', dept: 'Marine', message: 'I will be an Admiral!' },
            { name: 'Helmeppo', dept: 'Marine', message: 'Wait for me!' },
            { name: 'Smoker', dept: 'Marine', message: 'White Chase.' },
            { name: 'Tashigi', dept: 'Marine', message: 'My glasses!' },
            { name: 'Hancock', dept: 'Kuja', message: 'Luffy my love!' }
        ];

        // --- Logic ---
        const handleNewCheckIn = (user) => {
            const now = new Date();
            const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

            // Update Total Count
            const newCount = totalCount.value + 1;
            gsap.to(animatedCount, {
                duration: 1,
                value: newCount,
                roundProps: "value",
                onUpdate: () => {
                    // Trigger pulse effect
                    isPulsing.value = true;
                    setTimeout(() => isPulsing.value = false, 500);
                }
            });
            totalCount.value = newCount;

            // Update Access Log (Add to top, keep max 10)
            accessLog.value.unshift({
                id: Date.now() + Math.random(),
                time: timeString,
                dept: user.dept,
                name: user.name
            });
            if (accessLog.value.length > 10) {
                accessLog.value.pop();
            }

            // Update Wish Stack (Add to bottom, keep max 5)
            // Note: In the UI we want new ones to appear at the bottom and push up.
            // But the requirement says "Stack pushes upwards", which usually means adding to the list.
            // Let's add to the array.
            wishStack.value.push({
                id: Date.now() + Math.random(),
                name: user.name,
                dept: user.dept,
                message: user.message
            });
            if (wishStack.value.length > 5) {
                wishStack.value.shift(); // Remove the oldest (top visual if flex-direction is column-reverse)
            }
        };

        const startSimulation = () => {
            setInterval(() => {
                const randomIndex = Math.floor(Math.random() * mockDB.length);
                handleNewCheckIn(mockDB[randomIndex]);
            }, 3000);
        };

        // --- Lifecycle ---
        onMounted(() => {
            // Initialize tsParticles
            tsParticles.load("tsparticles", {
                fpsLimit: 60,
                particles: {
                    number: {
                        value: 80,
                        density: {
                            enable: true,
                            value_area: 800
                        }
                    },
                    color: {
                        value: "#64ffda"
                    },
                    shape: {
                        type: "circle"
                    },
                    opacity: {
                        value: 0.3,
                        random: true,
                        anim: {
                            enable: true,
                            speed: 1,
                            opacity_min: 0.1,
                            sync: false
                        }
                    },
                    size: {
                        value: 3,
                        random: true,
                        anim: {
                            enable: false,
                            speed: 40,
                            size_min: 0.1,
                            sync: false
                        }
                    },
                    move: {
                        enable: true,
                        speed: 1,
                        direction: "top",
                        random: false,
                        straight: false,
                        out_mode: "out",
                        attract: {
                            enable: false,
                            rotateX: 600,
                            rotateY: 1200
                        }
                    }
                },
                interactivity: {
                    detect_on: "canvas",
                    events: {
                        onhover: {
                            enable: true,
                            mode: "repulse"
                        },
                        onclick: {
                            enable: true,
                            mode: "push"
                        },
                        resize: true
                    },
                    modes: {
                        grab: {
                            distance: 400,
                            line_linked: {
                                opacity: 1
                            }
                        },
                        bubble: {
                            distance: 400,
                            size: 40,
                            duration: 2,
                            opacity: 8,
                            speed: 3
                        },
                        repulse: {
                            distance: 100
                        },
                        push: {
                            particles_nb: 4
                        },
                        remove: {
                            particles_nb: 2
                        }
                    }
                },
                retina_detect: true,
                background: {
                    color: "#020c1b",
                    image: "",
                    position: "50% 50%",
                    repeat: "no-repeat",
                    size: "cover"
                }
            });

            // Start Simulation
            startSimulation();
            
            // Initial population
            handleNewCheckIn(mockDB[0]);
        });

        return {
            totalCount,
            animatedCount,
            accessLog,
            wishStack,
            isPulsing,
            countRef: ref(null)
        };
    }
});

app.mount('#app');
