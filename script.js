document.documentElement.requestFullscreen();
console.log(window.innerWidth, window.innerHeight);
document.getElementById('size').innerText =
window.innerWidth + " x " + window.innerHeight;

let popupCallback = null;

// 화면 전환 함수
function nextStep(stepNumber) {
    // 모든 화면 숨기기
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // 목표 화면 보여주기
    document.getElementById('step_' + stepNumber).classList.add('active');

    // step_2 진입 시 스크롤 초기화
    if(stepNumber === 2){
        requestAnimationFrame(() => {
            document.querySelector('.question_list').scrollTop = 0;
        });

    }
}


const answerButtons = document.querySelectorAll('.answer_btn');

answerButtons.forEach(button => {
    button.addEventListener('click', () => {

        const parent = button.parentElement;
        const siblings = parent.querySelectorAll('.answer_btn');

        siblings.forEach(btn => btn.classList.remove('active'));

        button.classList.add('active');
    });
});


let input = "";

function pressKey(num) {
    if (input.length < 6) {

        input += num;
        updateDots();

        if(input.length === 6){
            setTimeout(() => {
                checkPassword();
            }, 50);
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

// 기존 비밀번호 로직 수정
function checkPassword() {
    const correctPassword = "000000"; // 원하는 비밀번호로 수정
    if (input === correctPassword) {
        nextStep(4); // 비밀번호 맞으면 바로 5번(축하) 화면으로!
    } else {
        const passwordDots = document.getElementById('password_dots');

        passwordDots.classList.add('error');

        setTimeout(() => {
            passwordDots.classList.remove('error');
            clearKeys();
        }, 550);
    }
}

function openPopup(message, callback = null){
    document.querySelector('.popup_text').innerText = message;
    popupCallback = callback;

    document.getElementById('popup').classList.add('active');
}

function closePopup(){
    document.getElementById('popup').classList.remove('active');

    if(popupCallback){
        popupCallback();
        popupCallback = null;
    }
}
function checkAnswers(){

    const questions = document.querySelectorAll('.answer_btns');

    let unanswered = false;
    let hasNo = false;

    questions.forEach(question => {

        const activeButton = question.querySelector('.answer_btn.active');

        // 선택 안 한 경우
        if(!activeButton){
            unanswered = true;
        }

        // NO 선택한 경우
        else if(activeButton.classList.contains('no')){
            hasNo = true;
        }

    });

    // 선택 안 한 항목 존재
    if(unanswered){
        openPopup("모든 항목을 선택해주세요.");
        return;
    }

    // NO 선택 존재
    if(hasNo){

    openPopup(
        "본인 확인에 실패하였습니다.\n\n당신은 라종근이 아닙니다.",
        () => {
           nextStep(1);

            // 선택 초기화
            document.querySelectorAll('.answer_btn').forEach(btn => {
                btn.classList.remove('active');
            });
        }
    );
    return;
}

    // 전부 YES
    nextStep(3);
}