import { createApp, ref, reactive, onMounted, nextTick, watch } from 'vue';

const app = createApp({
    setup() {
        // --- State ---
        const totalCount = ref(0);
        const animatedCount = ref(0);
        const accessLog = ref([]);
        const wishStack = ref([]);
        const isPulsing = ref(false);

        // --- Mock Data ---
        // Departments provided by user
        const departments = [
            '財務部', '資材部', '人力資源部', '營業部', 
            '台灣行銷部', '行銷技術部', '工程部', 
            'IA字型產品部', '外字產品暨專案部', '零售產品部', 
            '品質保證部', '產品支援部', '字體生產部'
        ];

        // Sample Chinese names for realism
        const firstNames = ['雅婷', '冠宇', '怡君', '宗翰', '佳穎', '家豪', '詩涵', '柏翰', '承恩', '宜庭', '禹安', '佩珊', '志豪', '郁婷', '俊宏', '欣儀', '偉倫', '心怡', '志偉', '雅雯'];
        const lastNames = ['陳', '林', '黃', '張', '李', '王', '吳', '劉', '蔡', '楊', '許', '鄭', '謝', '郭', '洪'];

        const generateMockDB = (count) => {
            const db = [];
            for (let i = 0; i < count; i++) {
                const dept = departments[Math.floor(Math.random() * departments.length)];
                const name = lastNames[Math.floor(Math.random() * lastNames.length)] + firstNames[Math.floor(Math.random() * firstNames.length)];
                db.push({
                    name: name,
                    dept: dept,
                    message: 'Happy New Year!' // Messages are anonymous now anyway
                });
            }
            return db;
        };

        const mockDB = generateMockDB(50);

        // Fun titles for anonymous messages
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
        const handleNewCheckIn = (user) => {
            const now = new Date();
            const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            // Update Total Count
            const newCount = totalCount.value + 1;
            gsap.to(animatedCount, {
                duration: 1,
                value: newCount,
                roundProps: "value",
                onUpdate: () => {
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
            // Assign a random fun title
            const randomTitle = funTitles[Math.floor(Math.random() * funTitles.length)];
            
            wishStack.value.push({
                id: Date.now() + Math.random(),
                title: randomTitle, // Use fun title instead of name
                message: user.message
            });
            if (wishStack.value.length > 5) {
                wishStack.value.shift();
            }
        };

        const startSimulation = () => {
            setInterval(() => {
                const randomIndex = Math.floor(Math.random() * mockDB.length);
                const randomUser = {
                    ...mockDB[randomIndex],
                    // Generate a new random message occasionally or just keep static
                    message: [
                        '新年快樂！', '大家辛苦了！', '中大獎！', '年終加倍！', '尾牙快樂！', 
                        'Gogoro 是我的！', '祝公司生意興隆', '平安喜樂', '吃飽喝足', '紅包拿來'
                    ][Math.floor(Math.random() * 10)]
                };
                handleNewCheckIn(randomUser);
            }, 3000);
        };

        // --- Lifecycle ---
        onMounted(() => {
            // Initialize tsParticles
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

            startSimulation();
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
