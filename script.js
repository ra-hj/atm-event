// 화면 전환 함수
function nextStep(stepNumber) {
    // 모든 화면 숨기기
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    // 목표 화면 보여주기
    document.getElementById('step-' + stepNumber).classList.add('active');
}

let input = "";
const correctPassword = "0511"; // 아버님 생신이나 기념일로 설정하세요!

function pressKey(num) {
    if (input.length < 4) {
        input += num;
        updateDots();
    }
}

function clearKeys() {
    input = "";
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

function checkPassword() {
    if (input === correctPassword) {
        document.getElementById('message').innerText = "출금 성공! 아빠 사랑해요 ♥";
        document.querySelector('.screen').style.background = "#004d00";
        // 여기서 실제 ATM 소리를 재생하거나 다음 단계 이미지를 보여줄 수 있습니다.
    } else {
        alert("비밀번호가 틀렸습니다. 다시 입력해 주세요!");
        clearKeys();
    }
}

// 기존 비밀번호 로직 수정
function checkPassword() {
    const correctPassword = "0511"; // 원하는 비밀번호로 수정
    if (input === correctPassword) {
        nextStep(5); // 비밀번호 맞으면 바로 5번(축하) 화면으로!
    } else {
        alert("비밀번호가 틀렸습니다. 다시 입력해 주세요!");
        clearKeys();
    }
}