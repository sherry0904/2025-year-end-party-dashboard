import { createApp, ref, computed, onMounted, watch, nextTick } from 'vue';

// ----------------------------------------------------------------------
// ⚠️ 請在此處貼上您的 Firebase Config
// 1. 前往 Firebase Console -> Project Settings
// 2. 複製 `firebaseConfig` 物件內容
// 3. 取代下方的 placeholder
// ----------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCZBoC9NZL40eGuMe5izzxd4XgPi9jLBwo",
  authDomain: "dynacw-year-end-party.firebaseapp.com",
  databaseURL: "https://dynacw-year-end-party-default-rtdb.firebaseio.com",
  projectId: "dynacw-year-end-party",
  storageBucket: "dynacw-year-end-party.firebasestorage.app",
  messagingSenderId: "275905237312",
  appId: "1:275905237312:web:0a305845182846b4732aa5"
};

// 若使用者尚未設定 Config，使用 Mock 模式 (只在本地記憶體運作)
const isMockMode = !firebaseConfig.databaseURL;

// Firebase Init
let db = null;
let rtdb = null; // ref to database

if (!isMockMode) {
    // 使用 ES Modules 引入 Firebase
    // 注意：這裡使用 CDN URL，確保 index.html/control.html 有引入 type="module"
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getDatabase, ref: dbRef, set, onValue, push, remove, update } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
    
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    rtdb = { ref: dbRef, set, onValue, push, remove, update };
} else {
    console.warn('⚠️ Firebase Config 未設定，目前處於「離線模擬模式」。重新整理網頁後資料會消失。');
}

// ----------------------------------------------------------------------
// Shared Logic Store
// ----------------------------------------------------------------------
const store = ref({
    currentPrize: { id: 'p1', name: '公司現金獎 - 6,000元', count: 7, presenter: 'Sunny', order: 1 },
    prizes: [
        { id: 'p1', name: '公司現金獎 - 6,000元', count: 7, presenter: 'Sunny', order: 1 },
        { id: 'p2', name: '公司現金獎 - 8,000元', count: 7, presenter: 'Franz', order: 2 },
        { id: 'p3', name: '公司現金獎 - 10,000元', count: 7, presenter: 'Ann', order: 3 },
        { id: 'p4', name: '公司現金獎 - 15,000元', count: 5, presenter: 'Ann', order: 4 },
        { id: 'p5', name: '公司現金獎 - 15,000元', count: 5, presenter: 'Carol', order: 5 },
        { id: 'p6', name: '資深員工獎 - 5,000元', count: 28, presenter: 'Amy', order: 6 },
        { id: 'p7', name: '公司第三特獎 - 30,000元', count: 1, presenter: 'Amy', order: 7 },
        { id: 'p8', name: '公司第二特獎 - 45,600元', count: 1, presenter: 'Amy', order: 8 },
        { id: 'p9', name: '公司第一特獎 - 60,000元', count: 1, presenter: 'Amy', order: 9 },
        { id: 'p10', name: '行銷技術部副理獎 - 3,600元', count: 1, presenter: '鄭惕元', order: 10 },
        { id: 'p11', name: '國際行銷部副理獎 - 3,600元', count: 1, presenter: '劉穎潔', order: 11 },
        { id: 'p12', name: '字體生產部副理獎 - 3,600元', count: 1, presenter: '許益慧', order: 12 },
        { id: 'p13', name: '字體生產部副理獎 - 3,600元', count: 1, presenter: '楊慧賢', order: 13 },
        { id: 'p14', name: '字體生產部副理獎 - 3,600元', count: 1, presenter: '葛幼寧', order: 14 },
        { id: 'p15', name: '字體工程部副理獎 - 3,600元', count: 1, presenter: '林俊男', order: 15 },
        { id: 'p16', name: '法務部副理獎 - 3,600元', count: 1, presenter: '呂雨嬛', order: 16 },
        { id: 'p17', name: '財務部副理獎 - 3,600元', count: 1, presenter: '姜玉芳', order: 17 },
        { id: 'p18', name: '人資部經理獎 - 6,000元', count: 1, presenter: '李雪芬', order: 18 },
        { id: 'p19', name: '品質保證部經理獎 - 6,000元', count: 1, presenter: '曹晉睿', order: 19 },
        { id: 'p20', name: '外字產品部經理獎 - 6,000元', count: 1, presenter: '李泓儒', order: 20 },
        { id: 'p21', name: 'IA字型產品部經理獎 - 6,000元', count: 1, presenter: '謝明憲', order: 21 },
        { id: 'p22', name: '行銷技術部 暨字體工程部協理獎 - 8,000元', count: 1, presenter: '黃曉文', order: 22 },
        { id: 'p23', name: '字體生產部協理獎 - 10,000元', count: 1, presenter: '簡亨儒', order: 23 },
        { id: 'p24', name: '副總經理 - 12,000元', count: 1, presenter: '李安', order: 24 },
        { id: 'p25', name: '財務部財務長獎 - 15,000元', count: 1, presenter: '張秀雲', order: 25 },
        { id: 'p26', name: '公司加碼獎 - 5,000元', count: 8, presenter: 'Carol', order: 26 },
        { id: 'p27', name: '公司加碼獎 - 5,000元', count: 9, presenter: 'Carol', order: 27 },
        { id: 'p28', name: '公司加碼獎 - 10,000元', count: 10, presenter: 'Amy', order: 28 },
        { id: 'p29', name: '羅董加碼獎 - 10,000元', count: 10, presenter: 'Amy', order: 29 }
    ],
    winners: [], // { id, name, dept, prizeId, timestamp }
    uiState: {
        isAnimating: false,
        lastWinner: null // The one being shown in big animation
    }
});

// ----------------------------------------------------------------------
// Data Synchronization (Firebase <-> Local Store)
// ----------------------------------------------------------------------
if (!isMockMode && rtdb) {
    const { ref: dbRef, onValue, set } = rtdb;
    
    // 1. Sync Prizes
    onValue(dbRef(db, 'prizes'), (snapshot) => {
        const val = snapshot.val();
        if (val) {
            store.value.prizes = val;
            console.log("🔥 Firebase: Prizes Synced", val);
        }
    });

    // 2. Sync Winners
    onValue(dbRef(db, 'winners'), (snapshot) => {
        const val = snapshot.val();
        if (val) {
            // Map object to array, preserving the Firebase Key
            store.value.winners = Object.entries(val).map(([key, data]) => ({
                ...data,
                firebaseKey: key
            }));
        } else {
            store.value.winners = [];
        }
        console.log("🔥 Firebase: Winners Synced", store.value.winners);
    });

    // 3. Sync Current Status (Prize Selection & Animation State)
    onValue(dbRef(db, 'status'), (snapshot) => {
        const val = snapshot.val();
        if (val) {
            if (val.currentPrize) {
                store.value.currentPrize = val.currentPrize;
            }
            if (val.uiState) {
                store.value.uiState = val.uiState;
            } else {
                // Keep default if missing from firebase
                if (!store.value.uiState) {
                    store.value.uiState = { isAnimating: false, lastWinner: null };
                }
            }
            console.log("🔥 Firebase: Status Synced", val);
        }
    });
}

// ----------------------------------------------------------------------
// Actions (Call these from Vue Components)
// ----------------------------------------------------------------------
const actions = {
    // 設定當前獎項
    setPrize(prize) {
        store.value.currentPrize = prize;
        if (!isMockMode) {
            rtdb.update(rtdb.ref(db, 'status'), { currentPrize: prize });
        }
    },
    
    // 執行抽獎 (新增得獎者)
    addWinner(employee) {
        // 1. Validation: Check Prize Limit
        const currentPrizeId = store.value.currentPrize.id;
        const currentWinnersCount = store.value.winners.filter(w => w.prizeId === currentPrizeId).length;
        
        if (currentWinnersCount >= store.value.currentPrize.count) {
            console.error("❌ 已達本獎項人數上限！");
            alert(`⚠️ 本獎項 (${store.value.currentPrize.name}) 已滿 ${store.value.currentPrize.count} 人，無法再新增！`);
            return false;
        }

        // 2. Validation: Check Global Duplicates (Person can only win ONCE)
        const isDuplicate = store.value.winners.some(w => {
            // Check by ID if both have ID
            if (w.id && employee.id) {
                return String(w.id) === String(employee.id);
            }
            // Fallback: Check by Name + Dept
            return w.name === employee.name && w.dept === employee.dept;
        });

        if (isDuplicate) {
            console.error("❌ 此人已中獎過！", employee);
            alert(`⚠️ ${employee.name} 已經中過獎了！無法重複中獎。`);
            return false;
        }

        // Ensure uiState exists
        if (!store.value.uiState) {
            store.value.uiState = { isAnimating: false, lastWinner: null };
        }

        const newWinner = {
            ...employee,
            id: employee.id || null, // Ensure ID is explicitly null if missing
            prizeId: store.value.currentPrize.id,
            prizeName: store.value.currentPrize.name,
            timestamp: Date.now()
        };

        // Local Optimistic Update
        store.value.winners.push(newWinner);
        store.value.uiState.lastWinner = newWinner;
        store.value.uiState.isAnimating = true;

        if (!isMockMode) {
            // Write to Firebase
            const newRef = rtdb.push(rtdb.ref(db, 'winners'));
            rtdb.set(newRef, newWinner);
            
            // Update Status (Trigger Animation on screens)
            rtdb.update(rtdb.ref(db, 'status/uiState'), {
                isAnimating: true,
                lastWinner: newWinner
            });
        }
        
        // Auto-stop animation after 2.5 seconds (snappy pace)
        setTimeout(() => {
           actions.resetAnimation();
        }, 2500);

        return true;
    },

    // 重置動畫狀態
    resetAnimation() {
        if (!store.value.uiState) return;
        
        // Only reset if currently animating to avoid redundant updates
        if (store.value.uiState.isAnimating) {
            store.value.uiState.isAnimating = false;
            if (!isMockMode && rtdb) {
                rtdb.update(rtdb.ref(db, 'status/uiState'), {
                    isAnimating: false
                });
            }
        }
    },

    // 刪除得獎者 (誤抽)
    removeWinner(winner) {
        // Optimistic local remove
        store.value.winners = store.value.winners.filter(w => w.timestamp !== winner.timestamp);

        if (!isMockMode && rtdb && winner.firebaseKey) {
            // Remove from Firebase using the key
            rtdb.remove(rtdb.ref(db, `winners/${winner.firebaseKey}`));
            console.log(`🔥 Firebase: Removed winner ${winner.name} (${winner.firebaseKey})`);
        } else {
            console.warn("Cannot remove from Firebase: Missing key or mock mode");
        }
    },
    
    // 新增/修改獎項
    updatePrizes(newPrizes) {
        store.value.prizes = newPrizes;
        if (!isMockMode) {
            rtdb.set(rtdb.ref(db, 'prizes'), newPrizes);
        }
    }
};


const fetchRoster = async () => {
    // 暫時使用各種假資料方便測試
    // 在真實場景，這裡會呼叫跟 app.js 一樣的 Google Script API
    return [
       { id: 8801, name: "王小明", dept: "工程部" },
       { id: 8802, name: "陳小美", dept: "設計部" },
       { id: 8803, name: "林大山", dept: "行銷部" },
       { id: 8804, name: "張志明", dept: "業務部" },
       { id: 8805, name: "李春嬌", dept: "財務部" },
       { id: 8806, name: "Keanu Reeves", dept: "IT Dept" },
       { id: null, name: "神祕嘉賓", dept: "VIP" }, // Special case: No ID
    ];
};

export { store, actions, fetchRoster, isMockMode, db, rtdb };
