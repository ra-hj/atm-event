// ======================================================
// 생신용돈 ATM 전체 JS 수정본
// - BGM은 step6에서만 실제 재생
// - 첫 사용자 조작 때 미리 오디오 잠금 해제
// - 기존 중복 코드 제거
// ======================================================


// ==========================
// 기본 설정
// ==========================

// 실제 파일명이 music_birthday.MP3 처럼 대문자면 아래 경로도 대문자로 바꾸세요.
const BGM_PATH = './audio/music_birthday.mp3';

// 버튼 효과음도 실제 파일명 대소문자와 맞춰야 합니다.
const BUTTON_SOUND_PATH = './audio/button.MP3';

let popupCallback = null;
let input = "";
let currentCaptcha = 0;

let bgmReady = false;
let bgmUnlocked = false;
let buttonSound = null;


// ==========================
// CAPTCHA 데이터
// ==========================
const captchaData = [
    {
        title: "진짜 신동철을 고르세요.",
        correct: 1
    },
    {
        title: "진짜 왕승리를 고르세요.",
        correct: 1
    },
    {
        title: "가장 최근 모습의 김학순을 고르세요.",
        correct: 1
    }
];


// ==========================
// 페이지 로드 후 초기화
// ==========================
window.addEventListener('load', () => {
    window.scrollTo(0, 0);

    resetBgm();
    setupBgmUnlock();
    setupGallery();
    setupStep6GalleryPause();
    setupButtonSounds();
    setupStep5ToStep6Trigger();
});


// ==========================
// BGM 관련 함수
// ==========================

function getBgm() {
    return document.getElementById('birthday_bgm');
}

function resetBgm() {
    const bgm = getBgm();

    if (!bgm) return;

    bgm.pause();
    bgm.currentTime = 0;
    bgm.muted = false;
    bgm.volume = 1;
}

function prepareBgm() {
    const bgm = getBgm();

    if (!bgm) {
        console.log("BGM audio 태그를 찾을 수 없습니다.");
        return null;
    }

    if (!bgmReady) {
        bgm.preload = 'auto';
        bgm.src = BGM_PATH;
        bgm.load();
        bgmReady = true;
    }

    return bgm;
}

// Fully Kiosk / Android WebView 대응용
// 첫 터치, 클릭, 키 입력 때 무음으로 한번 재생했다가 멈춰서 오디오 권한을 열어둠
function unlockBgmOnce() {
    if (bgmUnlocked) return;

    const bgm = prepareBgm();
    if (!bgm) return;

    bgm.muted = true;
    bgm.volume = 0;

    const playPromise = bgm.play();

    if (playPromise && typeof playPromise.then === 'function') {
        playPromise
            .then(() => {
                bgm.pause();
                bgm.currentTime = 0;
                bgm.muted = false;
                bgm.volume = 1;

                bgmUnlocked = true;
                console.log("BGM unlock 성공");
            })
            .catch(error => {
                bgm.pause();
                bgm.currentTime = 0;
                bgm.muted = false;
                bgm.volume = 1;

                console.log("BGM unlock 실패:", error);
            });
    }
}

function setupBgmUnlock() {
    // pointerdown이 가장 안정적이지만, 구형 WebView 대비해서 여러 이벤트를 같이 걸어둠
    document.addEventListener('pointerdown', unlockBgmOnce, { passive: true });
    document.addEventListener('touchstart', unlockBgmOnce, { passive: true });
    document.addEventListener('mousedown', unlockBgmOnce);
    document.addEventListener('keydown', unlockBgmOnce);
}

function playBgmOnlyStep6() {
    const step6 = document.getElementById('step_6');

    // step6이 아니면 절대 재생하지 않음
    if (!step6 || !step6.classList.contains('active')) {
        return;
    }

    const bgm = prepareBgm();
    if (!bgm) return;

    bgm.muted = false;
    bgm.volume = 1;

    try {
        bgm.currentTime = 0;
    } catch (e) {
        console.log("BGM currentTime 초기화 실패:", e);
    }

    const playPromise = bgm.play();

    if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(error => {
            console.log("BGM 재생 실패:", error);
            alert("BGM 재생 실패: " + error.message + "\n\nFully Kiosk 설정에서 Autoplay Audio/Video 허용 여부와 파일 경로를 확인하세요.");
        });
    }
}

function stopBgm() {
    const bgm = getBgm();

    if (!bgm) return;

    bgm.pause();

    try {
        bgm.currentTime = 0;
    } catch (e) {
        console.log("BGM 정지 중 currentTime 초기화 실패:", e);
    }
}


// ==========================
// 갤러리 초기화
// ==========================
function setupGallery() {
    const track = document.querySelector('.rolling_track');

    if (!track) return;

    // 원본 사진들을 랜덤으로 섞음
    let originalItems = Array.from(track.querySelectorAll('.gallery_item'));
    originalItems.sort(() => Math.random() - 0.5);

    // 기존 트랙 비우기
    track.innerHTML = '';

    // 첫 번째 그룹 생성
    const group1 = document.createElement('div');
    group1.classList.add('marquee_group');

    originalItems.forEach(item => {
        group1.appendChild(item);
    });

    // 무한 루프용 복제 그룹 생성
    const group2 = group1.cloneNode(true);

    track.appendChild(group1);
    track.appendChild(group2);
}


// ==========================
// STEP 6 갤러리 누르면 멈춤
// ==========================
function setupStep6GalleryPause() {
    const step6Screen = document.getElementById('step_6');
    const track = document.querySelector('.rolling_track');

    if (!step6Screen || !track) return;

    const pauseGallery = () => {
        track.classList.add('paused');
    };

    const playGallery = () => {
        track.classList.remove('paused');
    };

    // PC
    step6Screen.addEventListener('mousedown', pauseGallery);
    step6Screen.addEventListener('mouseup', playGallery);
    step6Screen.addEventListener('mouseleave', playGallery);

    // 모바일
    step6Screen.addEventListener('touchstart', pauseGallery, { passive: true });
    step6Screen.addEventListener('touchend', playGallery);
    step6Screen.addEventListener('touchcancel', playGallery);
}


// ==========================
// 버튼 효과음
// ==========================
function setupButtonSounds() {
    buttonSound = new Audio(BUTTON_SOUND_PATH);

    const allButtons = document.querySelectorAll('.keypad button, .main_btn');

    allButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!buttonSound) return;

            buttonSound.currentTime = 0;

            buttonSound.play().catch(error => {
                console.log("버튼 소리 재생 오류:", error);
            });
        });
    });
}


// ==========================
// 화면 전환
// ==========================
function nextStep(stepNumber) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    const targetScreen = document.getElementById('step_' + stepNumber);

    if (!targetScreen) {
        console.log("step_" + stepNumber + " 화면을 찾을 수 없습니다.");
        return;
    }

    targetScreen.classList.add('active');

    // step6이 아니면 BGM 정지
    if (stepNumber !== 6) {
        stopBgm();
    }

    // step6에서만 BGM 재생 + 하트 눈 효과
    if (stepNumber === 6) {
        fireHeartSnowConfetti('step_6');
        playBgmOnlyStep6();
    }
}


// ==========================
// 팝업
// ==========================
function openPopup(message, callback = null) {
    const popupText = document.querySelector('.popup_text');
    const popup = document.getElementById('popup');

    if (!popupText || !popup) return;

    popupText.innerText = message;
    popupCallback = callback;

    popup.classList.add('active');
}

function closePopup() {
    const popup = document.getElementById('popup');

    if (!popup) return;

    popup.classList.remove('active');

    if (popupCallback) {
        popupCallback();
        popupCallback = null;
    }
}


// ==========================
// 숫자 입력
// ==========================
function pressKey(num) {
    if (input.length < 6) {
        input += num;
        updateDots();

        // 6자리 입력 시 자동 확인
        if (input.length === 6) {
            setTimeout(() => {
                checkPassword();
            }, 100);
        }
    }
}

function clearKeys() {
    input = "";
    updateDots();
}

function deleteKey() {
    input = input.slice(0, -1);
    updateDots();
}

function updateDots() {
    const dots = document.querySelectorAll('.dot');

    dots.forEach((dot, index) => {
        if (index < input.length) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}


// ==========================
// 비밀번호 확인
// ==========================
function checkPassword() {
    const correctPassword = "670215";

    if (input === correctPassword) {
        nextStep(3);
        return;
    }

    const passwordDots = document.getElementById('password_dots');
    const passwordText = document.getElementById('password_text');

    if (!passwordDots || !passwordText) return;

    passwordText.innerText = "비밀번호가 일치하지 않습니다.";

    passwordDots.classList.add('error');
    passwordText.classList.add('error_text');

    setTimeout(() => {
        passwordDots.classList.remove('error');
        passwordText.classList.remove('error_text');

        clearKeys();

        passwordText.innerText = "본인 확인을 위해 비밀번호 6자리를 입력해주세요.";
    }, 700);
}


// ==========================
// CAPTCHA
// ==========================
function startCaptcha() {
    currentCaptcha = 0;
    nextStep(4);
    renderCaptcha();
}

function renderCaptcha() {
    const quizCount = document.getElementById('quiz_count');
    const progressFill = document.getElementById('progress_fill');
    const captchaTitle = document.getElementById('captcha_title');
    const captchaGrid = document.getElementById('captcha_grid');

    if (!quizCount || !progressFill || !captchaTitle || !captchaGrid) {
        console.log("CAPTCHA 요소를 찾을 수 없습니다.");
        return;
    }

    const data = captchaData[currentCaptcha];

    quizCount.innerText = `추가 인증 (${currentCaptcha + 1} / 3)`;
    progressFill.style.width = `${((currentCaptcha + 1) / 3) * 100}%`;
    captchaTitle.innerText = data.title;

    captchaGrid.innerHTML = "";

    // 이미지 번호 배열
    const randomImages = [1, 2, 3, 4, 5, 6];

    // Fisher-Yates 셔플
    for (let i = randomImages.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [randomImages[i], randomImages[j]] = [randomImages[j], randomImages[i]];
    }

    const correctImage = data.correct;

    let isProcessing = false;

    for (let i = 0; i < 6; i++) {
        const item = document.createElement('button');
        item.classList.add('captcha_item');

        item.innerHTML = `<img src="./images/captcha/${currentCaptcha + 1}_${randomImages[i]}.jpg">`;

        item.onclick = () => {
            if (isProcessing) return;

            isProcessing = true;

            // 정답
            if (randomImages[i] === correctImage) {
                item.classList.add('correct');

                setTimeout(() => {
                    const overlay = document.getElementById('correct_overlay');

                    if (!overlay) {
                        console.log("correct_overlay 요소를 찾을 수 없습니다.");
                        return;
                    }

                    const spinner = overlay.querySelector('.loading_spinner');
                    const check = overlay.querySelector('.check_mark');

                    overlay.classList.add('active');

                    if (spinner) spinner.style.display = 'block';
                    if (check) check.style.display = 'none';

                    setTimeout(() => {
                        if (spinner) spinner.style.display = 'none';
                        if (check) check.style.display = 'block';

                        const successSound = new Audio('./audio/success.mp3');
                        successSound.play().catch(e => {
                            console.log("성공 소리 재생 에러:", e);
                        });

                        setTimeout(() => {
                            overlay.classList.remove('active');

                            currentCaptcha++;

                            if (currentCaptcha < captchaData.length) {
                                renderCaptcha();
                            } else {
                                nextStep(5);
                                fireHeartFireworks('step_5');
                            }
                        }, 600);

                    }, 800);

                }, 400);

            } else {
                // 오답
                item.classList.add('correct');

                setTimeout(() => {
                    item.classList.remove('correct');
                    item.classList.add('wrong');

                    const wrongSound = new Audio('./audio/wrong.mp3');
                    wrongSound.play().catch(e => {
                        console.log("오답 소리 재생 에러:", e);
                    });

                    setTimeout(() => {
                        item.classList.remove('wrong');
                        isProcessing = false;
                    }, 500);

                }, 600);
            }
        };

        captchaGrid.appendChild(item);
    }
}


// ==========================
// 폭죽 효과 1: 팡 터지는 효과
// ==========================
function fireExplosionConfetti() {
    const count = 200;
    const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999
    };

    function fire(particleRatio, opts) {
        confetti(Object.assign({}, defaults, opts, {
            particleCount: Math.floor(count * particleRatio)
        }));
    }

    fire(0.25, {
        spread: 26,
        startVelocity: 55
    });

    fire(0.2, {
        spread: 60
    });

    fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
    });

    fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
    });

    fire(0.1, {
        spread: 120,
        startVelocity: 45
    });
}


// ==========================
// 폭죽 효과 2: STEP 5 불꽃놀이
// ==========================
function fireHeartFireworks(targetStepId) {
    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const zones = [
        { min: 0.1, max: 0.35 },
        { min: 0.35, max: 0.65 },
        { min: 0.65, max: 0.9 }
    ];

    let zoneIndex = 0;

    function shoot() {
        const currentStep = document.getElementById(targetStepId);

        if (!currentStep || !currentStep.classList.contains('active')) {
            return;
        }

        const currentZone = zones[zoneIndex];
        const targetX = randomInRange(currentZone.min, currentZone.max);

        zoneIndex = (zoneIndex + 1) % 3;

        confetti({
            particleCount: Math.floor(randomInRange(70, 110)),
            spread: 360,
            startVelocity: randomInRange(25, 35),
            gravity: 0.35,
            ticks: 400,
            colors: ['#DE1A58', '#F4B342', '#41A67E', '#05339C', '#FFD150', '#BBE0EF'],
            shapes: ['circle', 'square'],
            scalar: randomInRange(0.4, 0.8),
            zIndex: 1,
            origin: {
                x: targetX,
                y: randomInRange(0.1, 0.5)
            }
        });
    }

    const duration = 12000000;
    const animationEnd = Date.now() + duration;

    (function loop() {
        const currentStep = document.getElementById(targetStepId);

        if (!currentStep || !currentStep.classList.contains('active')) {
            return;
        }

        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) return;

        shoot();

        if (Math.random() < 0.4) {
            setTimeout(shoot, 1600);
        }

        setTimeout(loop, randomInRange(1600, 2400));
    }());
}


// ==========================
// 폭죽 효과 3: STEP 6 하트 눈 효과
// ==========================
function fireHeartSnowConfetti(targetStepId) {
    const semiTransparentHeart = confetti.shapeFromText({
        text: '🩵',
        color: 'rgba(65, 166, 126, 0.5)'
    });

    const duration = 600000;
    const animationEnd = Date.now() + duration;

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    (function frame() {
        const currentStep = document.getElementById(targetStepId);

        if (!currentStep || !currentStep.classList.contains('active')) {
            return;
        }

        const timeLeft = animationEnd - Date.now();

        if (Math.random() < 0.3) {
            confetti({
                particleCount: 1,
                startVelocity: 0,
                ticks: randomInRange(600, 900),
                gravity: randomInRange(0.2, 0.4),
                origin: {
                    x: Math.random(),
                    y: Math.random() * 0.2 - 0.2
                },
                colors: ['#ffffff'],
                shapes: [semiTransparentHeart],
                scalar: randomInRange(0.8, 1.5),
                drift: randomInRange(-0.4, 0.4),
                zIndex: 1
            });
        }

        if (timeLeft > 0) {
            requestAnimationFrame(frame);
        }
    }());
}


// ==========================
// STEP 5 -> STEP 6 전환
// ==========================
function triggerStep6() {
    const step5 = document.getElementById('step_5');

    if (step5 && step5.classList.contains('active')) {
        unlockBgmOnce();

        if (typeof confetti !== 'undefined') {
            confetti.reset();
        }

        nextStep(6);
    }
}

function setupStep5ToStep6Trigger() {
    // 화면 어디든 클릭/터치하면 STEP 6으로 이동
    document.addEventListener('click', triggerStep6);

    // 블루투스 리모컨, 키보드 입력으로도 STEP 6 이동
    document.addEventListener('keydown', triggerStep6);
}