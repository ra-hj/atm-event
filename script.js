window.addEventListener('load', () => {
    window.scrollTo(0,0);
});

let popupCallback = null;

let input = "";

// CAPTCHA 데이터
const captchaData = [

    {
        title : "진짜 신서방을 골라주세요.",
        correct : 1
    },

    {
        title : "진짜 왕서방을 골라주세요.",
        correct : 5
    },

    {
        title : "진짜 와이프를 찾으세요.",
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

    const correctPassword = "000000";

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


        // 이미지 6개 생성
        for(let i = 0; i < 6; i++){

            const item =
            document.createElement('button');

            item.classList.add('captcha_item');

            item.innerHTML =
            `<img src="./images/captcha/${currentCaptcha + 1}_${randomImages[i]}.jpg">`;

            item.onclick = () => {

                // 정답
                if(randomImages[i] === correctImage){

                    item.classList.add('correct');

                    setTimeout(() => {

                        currentCaptcha++;

                        if(currentCaptcha < captchaData.length){

                            renderCaptcha();

                        }else{

                            nextStep(5);
                        }

                    }, 700);

                }else{

                    // 오답
                    item.classList.add('correct');

                    setTimeout(() => {

                        item.classList.remove('correct');

                        item.classList.add('wrong');

                        setTimeout(() => {

                            item.classList.remove('wrong');

                        }, 500);

                    }, 600);
                }
            };

            captchaGrid.appendChild(item);
        }
}