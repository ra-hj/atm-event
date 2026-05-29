window.addEventListener('load', () => {
    window.scrollTo(0,0);

    // 🌟 [추가] 처음 1~5단계 배경음악 볼륨을 작게 조절 (0.0 ~ 1.0)
    const bgm = document.getElementById('birthday_bgm');
    if (bgm) {
        bgm.volume = 0.2; // 20% 크기로 잔잔하게 재생
    }

    // 🌟 [일자형 무한 컨베이어 벨트 + 랜덤 배치 세팅]
    const track = document.querySelector('.rolling_track');

    if (track) {
        // 1. 원본 사진 12장을 가져와서 무작위(랜덤)로 섞습니다.
        let originalItems = Array.from(track.querySelectorAll('.gallery_item'));
        originalItems.sort(() => Math.random() - 0.5);

        // 2. 기존 트랙을 비우고, 사진을 담을 첫 번째 그룹 바구니를 만듭니다.
        track.innerHTML = ''; 
        const group1 = document.createElement('div');
        group1.classList.add('marquee_group');
        
        // 3. 랜덤하게 섞인 사진들을 바구니에 담습니다.
        originalItems.forEach(item => group1.appendChild(item));

        // 4. 무한 루프를 위해 이 바구니를 복사해서 2개를 트랙에 올립니다.
        const group2 = group1.cloneNode(true);
        track.appendChild(group1);
        track.appendChild(group2);
    }

    // 🌟 [최종 업그레이드] 화면 전체(STEP 6) 어디든 터치/클릭하면 멈추기!
    const step6Screen = document.getElementById('step_6'); 
    
    if (step6Screen && track) {
        // 멈추고 다시 움직이는 함수
        const pauseGallery = () => track.classList.add('paused');
        const playGallery = () => track.classList.remove('paused');

        // PC 마우스 이벤트 (화면 전체 감지)
        step6Screen.addEventListener('mousedown', pauseGallery); 
        step6Screen.addEventListener('mouseup', playGallery);    
        step6Screen.addEventListener('mouseleave', playGallery); 

        // 모바일 터치 이벤트 (화면 전체 감지)
        step6Screen.addEventListener('touchstart', pauseGallery, {passive: true}); 
        step6Screen.addEventListener('touchend', playGallery);                     
    }

    // 🌟 [수정] 키패드 버튼 + 메인 버튼(출금하기, 인증하기) 누를 때 소리 나게 만들기
    //const buttonSound = new Audio('./audio/button.mp3');
    const buttonSound = new Audio('./audio/button.MP3');

    // 🎯 요기가 핵심! 기존 '.keypad button' 뒤에 ', .main_btn'을 추가해서 대상을 넓혔습니다.
    const allButtons = document.querySelectorAll('.keypad button, .main_btn');

    allButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // 버튼을 연속해서 누를 때를 대비해 소리 재생 위치를 0초로 초기화
            buttonSound.currentTime = 0; 
            buttonSound.play().catch(error => {
                console.log("버튼 소리 재생 오류:", error);
            });
        });
    });
});

let popupCallback = null;

let input = "";

// CAPTCHA 데이터
const captchaData = [

    {
        title : "진짜 신동철을 고르세요.",
        correct : 1
    },

    {
        title : "진짜 왕승리를 고르세요.",
        correct : 1
    },

    {
        title : "가장 최근 모습의 김학순을 고르세요.",
        correct : 1
    }

];

let currentCaptcha = 0;

// 화면 전환
function nextStep(stepNumber){
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    document
    .getElementById('step_' + stepNumber)
    .classList.add('active');

    // 🌟 [수정] 6단계로 넘어왔을 때의 특별 이벤트!
    if(stepNumber === 6) {
        // 1. 하트 눈 내리기
        fireHeartSnowConfetti('step_6');
        
        // 2. 노래 교체하고 재생하기
        const bgm = document.getElementById('birthday_bgm');
        if(bgm) {
            bgm.src = './audio/music_birthday.mp3'; // 🌟 6단계용 생일 노래로 파일 교체!
            bgm.volume = 0.5;                 // 🌟 볼륨을 다시 100%로 빵빵하게 키움!
            
            bgm.play().catch(error => {
                console.log("재생 오류:", error);
            });
        }
    }
}

// 팝업 열기
function openPopup(message, callback = null){

    document.querySelector('.popup_text').innerText =
    message;

    popupCallback = callback;

    document
    .getElementById('popup')
    .classList.add('active');
}

// 팝업 닫기
function closePopup(){

    document
    .getElementById('popup')
    .classList.remove('active');

    if(popupCallback){

        popupCallback();

        popupCallback = null;
    }
}

// 숫자 입력
function pressKey(num){

    if(input.length < 6){

        input += num;

        updateDots();

        // 6자리 입력 시 자동 확인
        if(input.length === 6){

            setTimeout(() => {

                checkPassword();

            }, 100);
        }
    }
}

// 전체 삭제
function clearKeys(){

    input = "";

    updateDots();
}

// 한 글자 삭제
function deleteKey(){

    input = input.slice(0, -1);

    updateDots();
}

// dot 업데이트
function updateDots(){

    const dots =
    document.querySelectorAll('.dot');

    dots.forEach((dot, index) => {

        if(index < input.length){

            dot.classList.add('active');

        }else{

            dot.classList.remove('active');
        }
    });
}

// 비밀번호 확인
function checkPassword(){

    const correctPassword = "670215";

    // 정답
    if(input === correctPassword){

        nextStep(3);

        return;
    }

    // 오답
    const passwordDots =
    document.getElementById('password_dots');

    const passwordText =
    document.getElementById('password_text');

    passwordText.innerText =
    "비밀번호가 일치하지 않습니다.";

    passwordDots.classList.add('error');

    passwordText.classList.add('error_text');

    setTimeout(() => {

        passwordDots.classList.remove('error');

        passwordText.classList.remove('error_text');

        clearKeys();

        passwordText.innerText =
        "본인 확인을 위해 비밀번호 6자리를 입력해주세요.";

    }, 700);
}

// CAPTCHA 시작
function startCaptcha(){

    currentCaptcha = 0;

    nextStep(4);

    renderCaptcha();
}

// CAPTCHA 렌더
function renderCaptcha(){

    const quizCount =
    document.getElementById('quiz_count');

    const progressFill =
    document.getElementById('progress_fill');

    const captchaTitle =
    document.getElementById('captcha_title');

    const captchaGrid =
    document.getElementById('captcha_grid');

    const data =
    captchaData[currentCaptcha];

    quizCount.innerText =
    `추가 인증 (${currentCaptcha + 1} / 3)`;

    progressFill.style.width =
    `${((currentCaptcha + 1) / 3) * 100}%`;

    captchaTitle.innerText =
    data.title;

    captchaGrid.innerHTML = "";

    // 이미지 번호 배열
        const randomImages = [1,2,3,4,5,6];

        // Fisher-Yates 셔플
        for(let i = randomImages.length - 1; i > 0; i--){

            const j = Math.floor(Math.random() * (i + 1));

            [randomImages[i], randomImages[j]] =
            [randomImages[j], randomImages[i]];
        }

        // 정답 이미지 번호
        const correctImage = data.correct;

        // 처음엔 아무것도 안 누른 상태 false로 시작
        let isProcessing = false;

        // 이미지 6개 생성
        for(let i = 0; i < 6; i++){

            const item =
            document.createElement('button');

            item.classList.add('captcha_item');

            item.innerHTML =
            `<img src="./images/captcha/${currentCaptcha + 1}_${randomImages[i]}.jpg">`;

            item.onclick = () => {

                // 이미 눌러서 처리 중(true)이면 아래 코드는 실행 X
                if (isProcessing) return; 

                // 방금 클릭했으니 처리 중(true) 상태 잠금.
                isProcessing = true;
                
            // 정답
            if(randomImages[i] === correctImage){
                // 🎯 1. 먼저 클릭한 사진에 초록색 테두리('correct' 클래스)를 즉시 입힙니다.
                item.classList.add('correct');
                
                // 🎯 2. [뜸 들이기] 바로 오버레이를 띄우지 않고 0.4초(400ms) 동안 기다립니다!
                setTimeout(() => {
                    const overlay = document.getElementById('correct_overlay');
                    const spinner = overlay.querySelector('.loading_spinner');
                    const check = overlay.querySelector('.check_mark');
                    
                    // 로딩 스피너 작동 시작
                    overlay.classList.add('active');
                    spinner.style.display = 'block';
                    check.style.display = 'none';

                    // 🎯 3. 로딩바가 0.6초 동안 빙글빙글 돕니다.
                    setTimeout(() => {
                        spinner.style.display = 'none';
                        check.style.display = 'block';
                        
                        // 띠링~ 성공 소리 재생
                        const successSound = new Audio('./audio/success.mp3'); 
                        successSound.play().catch(e => console.log("소리 재생 에러:", e));

                        // 🎯 4. 체크 마크를 0.6초 동안 보여준 뒤 다음 문제로 넘어갑니다.
                        setTimeout(() => {
                            overlay.classList.remove('active'); // 오버레이 닫기
                            
                            currentCaptcha++;
                            if(currentCaptcha < captchaData.length){
                                renderCaptcha(); 
                            }else{
                                // 대망의 마지막 캡챠를 통과했을 때!
                                nextStep(5); 
                                fireHeartFireworks('step_5');
                            }
                        }, 600);

                    }, 800); // 로딩바 지속 시간

                }, 400); // 🌟 여기가 바로 뜸 들이는 시간(0.4초)입니다! 숫자를 늘리면 더 뜸을 들입니다.
                            } else {
                    // 오답 (페이크로 처음엔 초록 테두리가 생깁니다)
                    item.classList.add('correct');

                    setTimeout(() => {
                        item.classList.remove('correct');
                        item.classList.add('wrong'); // 여기서 빨간 테두리로 변하며 흔들립니다!

                        // 🌟 [추가] 찰진 오답 효과음 재생! (빨간색으로 변할 때 딱 맞춰서 재생)
                        const wrongSound = new Audio('./audio/wrong.mp3'); 
                        wrongSound.play().catch(e => console.log("오답 소리 재생 에러:", e));

                        setTimeout(() => {
                            item.classList.remove('wrong');
                            // 오답 흔들림 애니메이션까지 다 끝났으니, 다시 누를 수 있게 잠금을 풀기
                            isProcessing = false;
                        }, 500);

                    }, 600); // 0.6초 뒤에 정체를 드러냄
                }
            };

            captchaGrid.appendChild(item);
        }
}


// 1. [팡! 터지는 폭죽 효과] - 빈 화면용
function fireExplosionConfetti() {
    var count = 200;
    var defaults = { origin: { y: 0.7 }, zIndex: 9999 };

    function fire(particleRatio, opts) {
        confetti(Object.assign({}, defaults, opts, {
            particleCount: Math.floor(count * particleRatio)
        }));
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
}

// 3. [일반 불꽃놀이 효과] - 구역을 나눠서 골고루 터지는 버전 🎆
function fireHeartFireworks(targetStepId) {
    function randomInRange(min, max) { return Math.random() * (max - min) + min; }

    // 🌟 1. 화면을 3개의 구역(Zone)으로 나눕니다.
    const zones = [
        { min: 0.1, max: 0.35 }, // 좌측 구역 (10% ~ 35%)
        { min: 0.35, max: 0.65 }, // 가운데 구역 (35% ~ 65%)
        { min: 0.65, max: 0.9 }  // 우측 구역 (65% ~ 90%)
    ];
    let zoneIndex = 0; // 처음에 터질 구역 (0 = 좌측)

    function shoot() {
        // 🌟 [핵심 해결책] 폭죽 발사 직전에 현재 화면(step_5)이 켜져 있는지 한 번 더 검사!
        // (이 코드가 빠져있어서 6단계에서도 터졌던 겁니다)
        const currentStep = document.getElementById(targetStepId);
        if (!currentStep || !currentStep.classList.contains('active')) {
            return; // 6단계로 넘어갔으면 예약된 불꽃 발사를 즉시 취소하고 퇴근합니다.
        }

        // 🌟 2. 이번에 터질 구역의 정보를 가져와서 X 좌표를 뽑습니다.
        const currentZone = zones[zoneIndex];
        const targetX = randomInRange(currentZone.min, currentZone.max);

        // 🌟 3. 다음 폭죽은 다음 구역에서 터지도록 인덱스를 넘겨줍니다. 
        // (0 -> 1 -> 2 -> 0 -> 1 ... 무한 반복)
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
            
            // 🌟 4. 방금 계산한 골고루 퍼진 X 좌표를 넣어줍니다!
            origin: { x: targetX, y: randomInRange(0.1, 0.5) }
        });
    }

    var duration = 12000000; 
    var animationEnd = Date.now() + duration;

    (function loop() {
        const currentStep = document.getElementById(targetStepId);
        if (!currentStep || !currentStep.classList.contains('active')) {
            //confetti.reset(); 
            return; 
        }

        var timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return; 

        shoot();
        
        // (작성해주신 여유로운 템포 세팅 유지)
        if (Math.random() < 0.4) { setTimeout(shoot, 1600); }
        setTimeout(loop, randomInRange(1600, 2400));
    }());
}


// 🌟 [추가/수정 코드] 4. [잔잔하게 떨어지는 하트 눈 효과] - STEP 6용 ❤️
// (기존 fireSnowConfetti를 하트 버전으로 대체)
function fireHeartSnowConfetti(targetStepId) {
    // 반투명한 핑크/화이트 톤 하트 모양 정의
    const semiTransparentHeart = confetti.shapeFromText({ 
        text: '🩵', 
        color: 'rgba(65, 166, 126, 0.5)'
    });

    var duration = 600000; 
    var animationEnd = Date.now() + duration;
    function randomInRange(min, max) { return Math.random() * (max - min) + min; }

    (function frame() {
        // 🌟 6단계(step_6) 화면이 켜져 있을 때만 작동!
        const currentStep = document.getElementById(targetStepId);
        if (!currentStep || !currentStep.classList.contains('active')) {
            //confetti.reset(); 
            return; 
        }

        var timeLeft = animationEnd - Date.now();

        // 배경에서 천천히 사르르 내리기 위해 확률을 0.3으로 조절
        if (Math.random() < 0.3) { 
            confetti({
                particleCount: 1, 
                startVelocity: 0, // 속도 없이 자연 낙하
                ticks: randomInRange(600, 900), // 🌟 화면 끝까지 떨어지도록 수명을 아주 길게!
                gravity: randomInRange(0.2, 0.4), // 🌟 더 느리고 가볍게 눈처럼 떨어지게 조절
                origin: { x: Math.random(), y: Math.random() * 0.2 - 0.2 }, // 위에서 생성
                
                colors: ['#ffffff'], // shape에서 이미 색상을 정했으므로 기본 흰색 전달
                shapes: [semiTransparentHeart], // 🌟 하트 모양 적용!
                scalar: randomInRange(0.8, 1.5), // 하트 크기는 너무 작지 않게 예쁘게
                drift: randomInRange(-0.4, 0.4), // 🌟 양옆으로 살짝 흩날리는 느낌 추가
                zIndex: 1 // 갤러리 뒤에 깔림
            });
        }
        if (timeLeft > 0) { requestAnimationFrame(frame); }
    }());
}


// [STEP 5 -> STEP 6 리모컨/터치 전환 이벤트]
function triggerStep6(event) {
    const step5 = document.getElementById('step_5');
    
    if (step5 && step5.classList.contains('active')) {
        
        confetti.reset(); 
        nextStep(6); 

        // 🌟 [추가 해결책] 딜레이 없이 즉시 하트 눈 효과를 켭니다!
        // setTimeout(() => { ... }, 300); // 🚨 이 줄을 지우고, 안의 함수만 밖에 꺼내놓습니다.
        fireHeartSnowConfetti('step_6');
    }
}

// 1. 화면 어디든 마우스 클릭 또는 손가락 터치가 일어났을 때 감지
document.addEventListener('click', triggerStep6);

// 2. 블루투스 리모컨(키보드 엔터, 스페이스, 방향키 등) 버튼이 눌렸을 때 감지
document.addEventListener('keydown', triggerStep6);