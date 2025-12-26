import { createApp, ref, computed, onMounted, onUnmounted, watch } from 'vue';

// 系統設定
const CONFIG = {
    apiUrl: 'https://script.google.com/macros/s/AKfycbzhmMw3kE7U8Z1isIVPv50Z9oKTWfCxKg2HuZhC4GpFIeg-2LK8L0Gne-U-ggyhX88R/exec', // Google Apps Script API 網址
    pollingIntervalMs: 5000,              // API 輪詢間隔（毫秒）
    countdownStepMs: 1000,                // 倒數計時更新頻率（毫秒）
    messageRotationIntervalMs: 3000,      // 留言輪播間隔（毫秒）
    messageIdleThresholdMs: 3000,         // 判定閒置時間門檻（毫秒）
    maxLogEntries: 10,                    // 報到記錄最大顯示筆數
    maxWishEntries: 5,                    // 留言最大顯示筆數
    typewriterSpeedMs: 100                // 打字機效果速度（毫秒/字）
};

const Typewriter = {
    props: {
        text: { type: String, required: true },
        speed: { type: Number, default: CONFIG.typewriterSpeedMs },
        showCursor: { type: Boolean, default: false }
    },
    setup(props) {
        const display = ref('');
        let timer = null;
        let startTimer = null;

        const startTyping = () => {
             display.value = ''; 
             if (timer) clearTimeout(timer);
             if (startTimer) clearTimeout(startTimer);

             let i = 0;
             startTimer = setTimeout(() => {
                 const type = () => {
                     if (i < props.text.length) {
                         display.value += props.text.charAt(i);
                         i++;
                         timer = setTimeout(type, props.speed);
                     }
                 };
                 type();
             }, 600);
        };

        onMounted(() => {
            startTyping();
        });

        watch(() => props.text, () => {
            startTyping();
        });

        onUnmounted(() => {
            if (timer) clearTimeout(timer);
            if (startTimer) clearTimeout(startTimer);
        });

        return { display };
    },
    template: `<span class="typewriter-text">{{ display }}<span v-if="showCursor" class="typewriter-cursor">▋</span></span>`
};

const app = createApp({
    components: {
        'typewriter': Typewriter
    },
    setup() {
        // --- State ---
        const totalCount = ref(0);
        const animatedCount = ref(0);
        const accessLog = ref([]);
        const wishStack = ref([]);
        const isPulsing = ref(false);
        const roster = ref([]);
        const processedIds = ref(new Set());
        const showAdminModal = ref(false);
        const searchTerm = ref('');
        const sortBy = ref('dept');
        const lastUpdateTime = ref('--:--:--');
        const secondsUntilNext = ref(Math.round(CONFIG.pollingIntervalMs / 1000));
        let isFetching = false;


        // --- Helpers ---
        const resetCountdown = () => {
            secondsUntilNext.value = Math.max(1, Math.round(CONFIG.pollingIntervalMs / 1000));
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
            '狗派間諜', '珍珠奶茶鑑賞家', '全勤獎(夢想中)得主', '來自深海的派大星',
            '會議室佔領者', '便當菜色評論家', '摸魚界的傳奇', '加班費收割機',
            '遲到藝術家', '早退先鋒', '請假達人', '病假專業戶',
            '廁所長住客', '零食儲藏大師', '咖啡因依賴者', '手搖飲代言人',
            '鬧鐘剋星', '週一厭世者', '週五狂喜者', '發薪日守望者',
            '摸魚冠軍', '划水高手', '躺平專家', '內卷抵抗軍',
            '股市觀察員', '虛擬貨幣信徒', '樂透研究員', '算命愛好者',
            '星座專家', '塔羅牌大師', '紫微斗數玩家', '風水顧問',
            '美食獵人', '吃播預備役', '宵夜戰士', '炸雞守護者',
            '火鍋教教主', '燒肉信徒', '拉麵狂熱者', '壽司鑑賞家',
            '甜點毀滅者', '手搖天王', '咖啡品鑑師', '茶道中人',
            '追劇專業戶', '漫畫收藏家', '遊戲肝帝', '電競選手(自封)',
            '社群潛水員', '網拍剁手黨', '直播觀眾', '迷因創作者',
            '鍵盤俠', '留言戰神', '按讚狂魔', '分享達人',
            '自拍天后', '修圖大師', '濾鏡收藏家', '網美候補',
            '旅遊規劃師', '機票獵人', '飯店評論家', '景點達人',
            '寵物奴才', '貓皇侍衛', '狗狗訓練師', '倉鼠管家'
        ];

        // --- Computed ---
        const missingCount = computed(() => {
            return roster.value.length - processedIds.value.size;
        });

        const filteredRoster = computed(() => {
            // Always create a shallow copy first to avoid mutating original roster.value via sort()
            let result = [...roster.value];

            // 1. Filter
            if (searchTerm.value.trim()) {
                const term = searchTerm.value.toLowerCase();
                result = result.filter(emp => 
                    emp.name.toLowerCase().includes(term) || 
                    String(emp.id).includes(term) || 
                    emp.dept.toLowerCase().includes(term)
                );
            }

            // 2. Sort (Safe to sort 'result' now as it is a copy or new array from filter)
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
            searchTerm.value = '';
        };

        const exportExcel = () => {
            // 準備資料
            const data = [
                ['員工編號', '姓名', '部門', '狀態']
            ];

            roster.value.forEach(emp => {
                const idStr = String(emp.id);
                const isCheckedIn = processedIds.value.has(idStr);
                const status = isCheckedIn ? '已報到' : '未報到';
                data.push([idStr, emp.name, emp.dept, status]);
            });

            // 建立工作表
            const ws = XLSX.utils.aoa_to_sheet(data);

            // 設定欄位寬度
            ws['!cols'] = [
                { wch: 12 },  // 員工編號
                { wch: 15 },  // 姓名
                { wch: 20 },  // 部門
                { wch: 10 }   // 狀態
            ];

            // 為每一行加上顏色
            roster.value.forEach((emp, index) => {
                const rowNum = index + 2; // +2 因為有標題列，且從1開始計數
                const idStr = String(emp.id);
                const isCheckedIn = processedIds.value.has(idStr);

                // 設定整列的背景顏色
                const fillColor = isCheckedIn 
                    ? { fgColor: { rgb: "C6EFCE" } }  // 淺綠色 (已報到)
                    : { fgColor: { rgb: "FFC7CE" } }; // 淺紅色 (未報到)

                const fontColor = isCheckedIn
                    ? { color: { rgb: "006100" } }    // 深綠色字 (已報到)
                    : { color: { rgb: "9C0006" } };   // 深紅色字 (未報到)

                // 為這一行的每個儲存格設定樣式
                ['A', 'B', 'C', 'D'].forEach(col => {
                    const cellRef = `${col}${rowNum}`;
                    if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };
                    ws[cellRef].s = {
                        fill: fillColor,
                        font: fontColor,
                        alignment: { vertical: 'center', horizontal: 'left' }
                    };
                });
            });

            // 標題列樣式
            ['A1', 'B1', 'C1', 'D1'].forEach(cellRef => {
                if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };
                ws[cellRef].s = {
                    fill: { fgColor: { rgb: "4472C4" } },  // 藍色背景
                    font: { color: { rgb: "FFFFFF" }, bold: true },  // 白色粗體字
                    alignment: { vertical: 'center', horizontal: 'center' }
                };
            });

            // 建立工作簿
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, '出席名單');

            // 匯出檔案
            const now = new Date();
            const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
            XLSX.writeFile(wb, `attendance_list_${timestamp}.xlsx`);
        };



        // 1. Fetch Data from API
        const fetchData = async () => {
            if (isFetching) return;
            resetCountdown();
            isFetching = true;

            try {
                const bustUrl = CONFIG.apiUrl + (CONFIG.apiUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
                const response = await fetch(bustUrl);
                const data = await response.json();
                processData(data);
                
                const now = new Date();
                lastUpdateTime.value = now.toLocaleTimeString('zh-TW', { hour12: false });
            } catch (error) {
                console.error('API Fetch Error:', error);
            } finally {
                isFetching = false;
            }
        };

        // 2. Process Data (Diffing)
        const processData = (data) => {
            if (!data) return;

            if (data.roster) {
                 roster.value = data.roster;
            }

            const rosterMap = new Map(roster.value.map(user => [String(user.id), user]));

            if (data.checkIns) {
                 const currentRemoteIds = new Set(data.checkIns.map(c => String(c.id)));
                 const toRemove = [];
                 processedIds.value.forEach(id => {
                     if (!currentRemoteIds.has(id)) {
                         toRemove.push(id);
                     }
                 });

                 if (toRemove.length > 0) {
                     toRemove.forEach(id => processedIds.value.delete(id));
                     const newCount = processedIds.value.size;
                     totalCount.value = newCount;
                     animatedCount.value = newCount;

                     if (newCount === 0) {
                         accessLog.value = [];
                         wishStack.value = [];
                     }
                 }

                data.checkIns.sort((a, b) => {
                    const tA = new Date(a.timestamp || 0).getTime();
                    const tB = new Date(b.timestamp || 0).getTime();
                    return tA - tB;
                });

                data.checkIns.forEach(checkIn => {
                    const idStr = String(checkIn.id);
                    if (!processedIds.value.has(idStr)) {
                        processedIds.value.add(idStr); 
                        let userInfo = rosterMap.get(idStr);
                        if (!userInfo) {
                            userInfo = { 
                                name: `查無此人 (${idStr})`, 
                                dept: '異常' 
                            };
                        }
                        handleNewCheckIn(userInfo, checkIn);
                    }
                });
            }
        };

        const allMessages = []; // Pool of all received messages
        const MAX_HISTORY_MESSAGES = 200; // Cap to prevent memory leak
        let lastActivityTime = Date.now();

        const handleNewCheckIn = (userInfo, checkInRaw) => {
            const newCount = processedIds.value.size;
            if (newCount !== totalCount.value) {
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
            }

            let dateObj = new Date();
            if (checkInRaw.timestamp) {
                dateObj = new Date(checkInRaw.timestamp);
            }
            const timeString = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;

            accessLog.value.unshift({
                id: checkInRaw.id + '_' + Date.now(), 
                time: timeString,
                dept: userInfo.dept,
                name: userInfo.name
            });
            if (accessLog.value.length > CONFIG.maxLogEntries) {
                accessLog.value.pop();
            }

            if (checkInRaw.message) {
                const randomTitle = funTitles[Math.floor(Math.random() * funTitles.length)];
                const newWish = {
                    id: checkInRaw.id + '_' + Date.now(),
                    title: randomTitle, 
                    message: checkInRaw.message
                };
                allMessages.push(newWish);
                if (allMessages.length > MAX_HISTORY_MESSAGES) {
                    allMessages.shift();
                }
                
                wishStack.value.unshift(newWish);
                if (wishStack.value.length > CONFIG.maxWishEntries) {
                    wishStack.value.pop();
                }
                lastActivityTime = Date.now();
            }
        };

        const startMessageRotation = () => {
            return setInterval(() => {
                const now = Date.now();
                if (now - lastActivityTime > CONFIG.messageIdleThresholdMs && allMessages.length > CONFIG.maxWishEntries) {
                    // Get messages currently displayed in wishStack (by actual message content)
                    const displayedMessages = new Set(wishStack.value.map(w => w.message));

                    // Filter messages that are NOT currently displayed (by content)
                    const unseenMessages = allMessages.filter(msg => !displayedMessages.has(msg.message));

                    // If we have unseen messages, prioritize them. Otherwise, use all messages.
                    const candidatePool = unseenMessages.length > 0 ? unseenMessages : allMessages;
                    
                    const randomMsg = candidatePool[Math.floor(Math.random() * candidatePool.length)];
                    const displayMsg = { ...randomMsg, id: 'replay_' + Date.now() };
                    wishStack.value.unshift(displayMsg);
                    if (wishStack.value.length > CONFIG.maxWishEntries) {
                        wishStack.value.pop();
                    }
                }
            }, CONFIG.messageRotationIntervalMs);
        };

        let pollingInterval;
        let countdownInterval;
        let messageRotationInterval;

        const handleKeydown = (e) => {
            // M for Admin Modal
            if (e.key === 'm' || e.key === 'M') {
                showAdminModal.value = !showAdminModal.value;
            }
        };

        onMounted(() => {
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

            pollingInterval = setInterval(fetchData, CONFIG.pollingIntervalMs);
            countdownInterval = setInterval(() => {
                if (secondsUntilNext.value > 0) {
                    secondsUntilNext.value -= 1;
                }
            }, CONFIG.countdownStepMs);
            
            window.addEventListener('keydown', handleKeydown);
            fetchData();
            messageRotationInterval = startMessageRotation();
        });

        onUnmounted(() => {
            if (pollingInterval) clearInterval(pollingInterval);
            if (countdownInterval) clearInterval(countdownInterval);
            if (messageRotationInterval) clearInterval(messageRotationInterval);
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
            closeAdminModal,
            exportExcel,
            lastUpdateTime,
            secondsUntilNext
        };
    }
});

app.mount('#app');
