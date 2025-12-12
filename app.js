import { createApp, ref, computed, onMounted, onUnmounted } from 'vue';

const app = createApp({
    setup() {
        // --- Configuration ---
        const API_URL = 'https://script.google.com/macros/s/AKfycbzhmMw3kE7U8Z1isIVPv50Z9oKTWfCxKg2HuZhC4GpFIeg-2LK8L0Gne-U-ggyhX88R/exec'; // To be updated by user or config

        // --- State ---
        const totalCount = ref(0);
        const animatedCount = ref(0);
        const accessLog = ref([]);
        const wishStack = ref([]);
        const isPulsing = ref(false);
        const roster = ref([]); // Full list of employees
        const processedIds = ref(new Set()); // Track check-ins to avoid duplicates
        const showAdminModal = ref(false);
        const searchTerm = ref('');
        const sortBy = ref('dept'); // 'dept' or 'id'

        // Fun titles for anonymous messages (kept from previous feature)
        // ...

        // --- Computed ---
        const missingCount = computed(() => {
            return roster.value.length - processedIds.value.size;
        });

        const filteredRoster = computed(() => {
            let result = roster.value;

            // 1. Filter
            if (searchTerm.value.trim()) {
                const term = searchTerm.value.toLowerCase();
                result = result.filter(emp => 
                    emp.name.toLowerCase().includes(term) || 
                    String(emp.id).includes(term) || 
                    emp.dept.toLowerCase().includes(term)
                );
            }

            // 2. Sort
            return result.sort((a, b) => {
                if (sortBy.value === 'dept') {
                    // Sort by Dept, then by ID
                    if (a.dept < b.dept) return -1;
                    if (a.dept > b.dept) return 1;
                    return a.id - b.id;
                } else {
                    // Sort by ID only
                    return a.id - b.id;
                }
            });
        });

        // --- Logic ---
        const closeAdminModal = () => {
            showAdminModal.value = false;
            searchTerm.value = ''; // Optional: clear search on close
        };
        const funTitles = [
            '期待中大獎的船員', '剛吃飽的吃貨', '想要加薪的特務', '潛水中的觀察員', 
            '來自未來的時空旅人', '謎樣的藏鏡人', '尾牙戰神', '為了紅包來的勇者',
            '專業陪跑員', '快樂的喝水專員', '路過的絕地武士', '深海大鳳梨',
            '正在發功的氣功師', '相信心誠則靈的信徒', '把老闆當偶像的粉絲', 
            '剛剛中樂透(夢裡)的人', '準備大吃一頓的戰士', '隱藏在民間的高手',
            '專業的分母', '被程式碼耽誤的歌王', '為了年終拼命的勇士', '只有今天不想加班',
            '飲水機的守護神', '下午茶團購主揪', '鍵盤冒險家', '螢幕保護程式觀察員',
            '辦公室的生存大師', '擁有神之手的男人', '擁有神之手的女人', '幸運女神的鄰居',
            '財神爺的乾兒子', '財神爺的乾女兒', '專業打包達人', '減肥是明天的事',
            '酒精蒸發器', '微醺的哲學家', '舞池裡的破壞王', '卡拉OK麥霸',
            '肝鐵人', '準時下班的傳說', 'Bug 獵人', '複製貼上大師',
            '簡報藝術家', '行走的表情包', '團購沒有我會倒', '薪水的守護者',
            '公司的吉祥物', '靠臉吃飯的(自稱)', '靠實力單身', '只是路過來吃飯的',
            '專業拍手專員', '氣氛組組長', '尾牙特攻隊', '抽獎箱的凝視者',
            '紅包磁鐵', '信用卡還款大隊長', '房貸消滅者', '貓派臥底',
            '狗派間諜', '珍珠奶茶鑑賞家', '全勤獎(夢想中)得主', '來自深海的派大星'
        ];

        // --- Logic ---
        
        // 1. Fetch Data from API
        const fetchData = async () => {
             if (API_URL === 'PLACEHOLDER_FOR_GAS_URL') {
                console.warn('API URL is not set. Using mock data strictly for testing if needed, or just waiting.');
                return;
            }

            try {
                const response = await fetch(API_URL);
                const data = await response.json();
                processData(data);
            } catch (error) {
                console.error("API Fetch Error:", error);
            }
        };

        // 2. Process Data (Diffing)
        const processData = (data) => {
            if (!data) return;

            // Update Roster if changed (or initial load)
            if (data.roster && data.roster.length > 0) {
                 roster.value = data.roster;
            }

            // Create a Map for quick lookup: ID -> Employee Info
            const rosterMap = new Map(roster.value.map(user => [String(user.id), user]));

            // Process Check-ins
            if (data.checkIns && Array.isArray(data.checkIns)) {
                data.checkIns.forEach(checkIn => {
                    const idStr = String(checkIn.id);
                    
                    if (!processedIds.value.has(idStr)) {
                        // NEW EVENT FOUND
                        processedIds.value.add(idStr);
                        
                        // Find user details
                        const userInfo = rosterMap.get(idStr) || { name: 'Unknown', dept: 'Unknown' };
                        
                        // Handle formatting
                        handleNewCheckIn(userInfo, checkIn);
                    }
                });
            }
        };

        const allMessages = []; // Pool of all received messages
        let lastActivityTime = Date.now();

        const handleNewCheckIn = (userInfo, checkInRaw) => {
            // Update Total Count (use processedIds size for accuracy)
            const newCount = processedIds.value.size;
            
            // Animate only if count actually changed (it should have)
            if (newCount !== totalCount.value) {
                gsap.to(animatedCount, {
                    duration: 1,
                    value: newCount,
                    roundProps: "value",
                    onUpdate: () => {
                        isPulsing.value = true;
                        // Reset pulse
                        setTimeout(() => isPulsing.value = false, 500); 
                    }
                });
                totalCount.value = newCount;
            }

            // Helper to get time string
            const now = new Date(); 
            const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            // Update Access Log (Left Panel) - Newest Top
            accessLog.value.unshift({
                id: checkInRaw.id + '_' + Date.now(), // Unique key
                time: timeString,
                dept: userInfo.dept,
                name: userInfo.name
            });
            if (accessLog.value.length > 10) {
                accessLog.value.pop();
            }

            // Update Wish Stack (Right Panel)
            if (checkInRaw.message) {
                // Assign a random fun title for the "Anonymous" effect
                const randomTitle = funTitles[Math.floor(Math.random() * funTitles.length)];

                const newWish = {
                    id: checkInRaw.id + '_' + Date.now(),
                    title: randomTitle, 
                    message: checkInRaw.message
                };

                // Add to Pool
                allMessages.push(newWish);

                // Add to Display (Newest Top)
                wishStack.value.unshift(newWish);
                if (wishStack.value.length > 5) {
                    wishStack.value.pop();
                }

                lastActivityTime = Date.now();
            }
        };

        // Ambient Message Rotation
        // If no new messages for a while, pick a random one from history to display
        const startMessageRotation = () => {
             setInterval(() => {
                const now = Date.now();
                // If idle for 3 seconds AND we have enough messages to rotate
                if (now - lastActivityTime > 3000 && allMessages.length > 5) {
                    const randomMsg = allMessages[Math.floor(Math.random() * allMessages.length)];
                    
                    // Create a visual copy with new ID to trigger transition
                    const displayMsg = { ...randomMsg, id: 'replay_' + Date.now() };

                    wishStack.value.unshift(displayMsg);
                    if (wishStack.value.length > 5) {
                        wishStack.value.pop();
                    }
                }
            }, 3000);
        };

        // --- Lifecycle ---
        let pollingInterval;

        const handleKeydown = (e) => {
            if (e.key === 'm' || e.key === 'M') {
                showAdminModal.value = !showAdminModal.value;
            }
        };

        onMounted(() => {
            // Initialize tsParticles (Same config as before)
            tsParticles.load("tsparticles", {
                fpsLimit: 60,
                particles: {
                    number: { value: 80, density: { enable: true, value_area: 800 } },
                    color: { value: "#64ffda" },
                    shape: { type: "circle" },
                    opacity: { value: 0.3, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
                    size: { value: 3, random: true, anim: { enable: false, speed: 40, size_min: 0.1, sync: false } },
                    move: { enable: true, speed: 1, direction: "top", random: false, straight: false, out_mode: "out", attract: { enable: false, rotateX: 600, rotateY: 1200 } }
                },
                interactivity: {
                    detect_on: "canvas",
                    events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" }, resize: true },
                    modes: { grab: { distance: 400, line_linked: { opacity: 1 } }, bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 }, repulse: { distance: 100 }, push: { particles_nb: 4 }, remove: { particles_nb: 2 } }
                },
                retina_detect: true,
                background: { color: "#020c1b", image: "", position: "50% 50%", repeat: "no-repeat", size: "cover" }
            });

            // Start API Polling
            pollingInterval = setInterval(fetchData, 3000);
            
            // Keyboard listener for Admin Modal
            window.addEventListener('keydown', handleKeydown);

            // Fetch immediately
            fetchData();

            // Start Message Rotation
            startMessageRotation();
        });

        onUnmounted(() => {
            if (pollingInterval) clearInterval(pollingInterval);
            window.removeEventListener('keydown', handleKeydown);
        });

        return {
            totalCount,
            animatedCount,
            accessLog,
            wishStack,
            isPulsing,
            showAdminModal,
            roster,
            filteredRoster,
            processedIds,
            missingCount,
            searchTerm,
            sortBy,
            closeAdminModal
        };
    }
});

app.mount('#app');
