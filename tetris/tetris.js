// Canvas 요소와 context 가져오기
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const nextcanvas = document.getElementById('nextGrid');
const nextctx = nextcanvas.getContext('2d');

const savecanvas = document.getElementById('otherPiece');
const savectx = savecanvas.getContext('2d');

// 다음에 나올 조각의 미리보기
let PieceArray = new Array();

// 게임 시작 시
let newstart = 1;

// 랜덤한 숫자가 중복이 되지 않게 하는 배열
var array = [];

// 점수
let score = 0;
let maxscore = 0 ;

// 게임 시작을 판단하는 변수
let isgamestart = 1;

// 테트리스 게임 상태
// 가운데 게임 화면
const cols = 10;
const rows = 20;
const grid = createEmptyGrid(cols, rows);

// 우측 다음 블록 화면
const nextcols = 6;
const nextrows = 11;
const Nextgrid = createEmptyGrid(nextcols, nextrows);

const savecols = 5;
const saverows = 5;
const savegrid = createEmptyGrid(savecols, saverows);

// 현재 블록
let currentPiece = generateRandomPiece();

// 임시로 저장한 블록
let savePiece;
let swapcount = 0;

// 키보드 이벤트 핸들러 등록
document.addEventListener('keydown', handleKeyPress);

// 게임 시작 전 알림
drawStart();

function drawStart() {
    ctx.beginPath();
    ctx.font = '15px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.fillText('Press S to start Game', canvas.width /2 , canvas.height/2);
    ctx.fillText('Your max Score : ' + maxscore, canvas.width/2, canvas.height/2+100);
    ctx.closePath();
}

function setdifficulty() {
    movePieceDown();

    var difficulty = 1000 * 1000 / (1000 + score);

    if(!isgamestart) {
        setTimeout(setdifficulty, difficulty);
    }
    
}

// 키보드 이벤트 핸들러 함수
function handleKeyPress(event) {
    if(isgamestart){
        if(event.code === 'KeyS'){
            GameStart();
        }
    }else{
        if (event.code === 'ArrowLeft') {
            movePieceLeft();
        } else if (event.code === 'ArrowRight') {
            movePieceRight();
        } else if (event.code === 'ArrowDown') {
            movePieceDown();
        } else if (event.code === 'KeyZ') {
            // 방향 전환
            rotatePiece();
        } else if(event.code === 'Space'){
            goToEND();
        } else if(event.code === 'KeyC'){
            swapPiece();
        }
    }
}

//게임 시작
function GameStart(){
    draw();
    isgamestart = 0;
    setdifficulty();
}

// 게임 화면 그리기
function draw() {
    clearCanvas();

    drawGrid();

    drawPiece();
    drawNextPiece();
    drawSavePiece();

    drawScore();
}

// Canvas 초기화
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    nextctx.clearRect(0, 0, nextcanvas.width, nextcanvas.height);
    savectx.clearRect(0, 0, savecanvas.width, savecanvas.height);
}

// 그리드 그리기
function drawGrid() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (grid[row][col]) {
                drawSquare(col, row);
            } else {
                drawSquare(col, row,'#E5E5E5','#cccccc');
            }
        }
    }
}

// 정사각형 그리기
function drawSquare(x, y, color = '#333333', strokecolor = '#cccccc') {
    const squareSize = canvas.width / cols;
    const squareX = x * squareSize;
    const squareY = y * squareSize;

    ctx.fillStyle = color;
    ctx.fillRect(squareX, squareY, squareSize, squareSize);
    ctx.strokeStyle = strokecolor;
    ctx.strokeRect(squareX, squareY, squareSize, squareSize);
}

// 블록 그리기
function drawPiece() {
    const piece = currentPiece.shape;
    const pieceColor = currentPiece.color;
    const pieceX = currentPiece.x;
    const pieceY = currentPiece.y;

    for (let row = 0; row < piece.length; row++) {
        for (let col = 0; col < piece[row].length; col++) {
            if (piece[row][col]) {
                drawSquare(pieceX + col, pieceY + row, pieceColor,'#777777');
            }
        }
    }
}


// 다음 블록 그리기
function drawNextPiece() {
    for(var index = 0; index <= 3; index++){
        const piece = PieceArray[index].shape;
        const pieceColor = PieceArray[index].color;
        const pieceX = 1;
        const pieceY = 1;

        for (let row = 0; row < piece.length; row++) {
            for (let col = 0; col < piece[row].length; col++) {
                if (piece[row][col]) {
                    drawNextSquare(pieceX + col, pieceY + row + index * 3, pieceColor);
                }
            }
        }
    }
}

// 다음 블록의 정사각형 그리기
function drawNextSquare(x, y, color) {
    const squareSize = nextcanvas.width / nextcols;
    const nextsquareX = x * squareSize;
    const nextsquareY = y * squareSize;

    nextctx.fillStyle = color;
    nextctx.fillRect(nextsquareX, nextsquareY, squareSize, squareSize);
    nextctx.strokeStyle = 'black';
    nextctx.strokeRect(nextsquareX, nextsquareY, squareSize, squareSize);
}

// 저장한 블록 그리기
function drawSavePiece() {
    if(savePiece != null){
        const piece = savePiece.shape;
        const pieceColor = savePiece.color;
        const pieceX = 1;
        const pieceY = 1;

        for (let row = 0; row < piece.length; row++) {
            for (let col = 0; col < piece[row].length; col++) {
                if (piece[row][col]) {
                    drawSaveSquare(pieceX + col, pieceY + row, pieceColor);
                }
            }
        }
    }
}

// 저장한 블록의 정사각형 그리기
function drawSaveSquare(x, y, color) {
    const squareSize = nextcanvas.width / nextcols;
    const nextsquareX = x * squareSize;
    const nextsquareY = y * squareSize;

    savectx.fillStyle = color;
    savectx.fillRect(nextsquareX, nextsquareY, squareSize, squareSize);
    savectx.strokeStyle = 'black';
    savectx.strokeRect(nextsquareX, nextsquareY, squareSize, squareSize);
}



// 점수 그리기
function drawScore() {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + score, 10, 30);
}



// 블록 이동 - 왼쪽
function movePieceLeft() {
    if (canMovePiece(currentPiece, -1, 0)) {
        currentPiece.x--;
        draw();
    }
}

// 블록 이동 - 오른쪽
function movePieceRight() {
    if (canMovePiece(currentPiece, 1, 0)) {
        currentPiece.x++;
        draw();
    }
}

// 블록 이동 - 아래로
function movePieceDown() {
    if (canMovePiece(currentPiece, 0, 1) && !isgamestart) {
        currentPiece.y++;
        draw();
    } else {
        placePiece();
        checkLines();
        currentPiece = generateRandomPiece();
        gameOver();
    }
}

// 블록 이동 - 끝까지 내리기
function goToEND(){ 
    while (canMovePiece(currentPiece, 0, 1)) {
        currentPiece.y++;
    }
    draw();
    placePiece();
    checkLines();
    currentPiece = generateRandomPiece();
    gameOver();
}

function gameOver() {
    if (!canMovePiece(currentPiece, 0, 0)) {
        if( score > maxscore ){
            maxscore = score;
        }
        // 게임 오버
        alert('You died!\nYour Score is ' + score
        + '\n Your max Score is ' + maxscore);
        
        resetGame();
    }
}

// 블록을 임시로 저장
function swapPiece() {
    if ( swapcount  == 0){
        if (savePiece == null) {
            savePiece = currentPiece;
            currentPiece = generateRandomPiece();
        } else {
            let instance = savePiece;
            savePiece = currentPiece;
            currentPiece = instance;
            currentPiece.x = Math.floor((cols - currentPiece.shape[0].length) / 2);
            currentPiece.y = 0;
        }
        // 블록 변경을 1회로 제한하기 위한 변수
        swapcount = 1;
        draw();
    }       
}

// 블록 회전
function rotatePiece() {
    const rotatedPiece = rotateMatrix(currentPiece.shape);
    if (canMovePiece({ ...currentPiece, shape: rotatedPiece }, 0, 0)) {
        currentPiece.shape = rotatedPiece;
        draw();
    }
}

// 블록을 그리드에 배치
function placePiece() {
    const piece = currentPiece.shape;
    const pieceX = currentPiece.x;
    const pieceY = currentPiece.y;
    swapcount = 0;

    for (let row = 0; row < piece.length; row++) {
        for (let col = 0; col < piece[row].length; col++) {
            if (piece[row][col]) {
                const gridX = pieceX + col;
                const gridY = pieceY + row;
                grid[gridY][gridX] = 1;
            }
        }
    }
}

// 완전한 줄이 있는지 확인하고 삭제
function checkLines() {
    for (let row = rows - 1; row >= 0; row--) {
        if (grid[row].every(cell => cell)) {
            grid.splice(row, 1);
            grid.unshift(Array(cols).fill(0));
            score += 10;
        }
    }
}

// 블록 이동 가능한지 확인
function canMovePiece(piece, offsetX, offsetY) {
    const { shape, x, y } = piece;

    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const newX = x + col + offsetX;
                const newY = y + row + offsetY;
                if (
                    newX < 0 ||
                    newX >= cols ||
                    newY >= rows ||
                    (newY >= 0 && grid[newY][newX])
                ) {
                    return false;
                }
            }
        }
    }

    return true;
}

// 게임 초기화
function resetGame() {
    grid.forEach(row => row.fill(0));
    Nextgrid.forEach(row => row.fill(0));
    savegrid.forEach(row => row.fill(0));
    score = 0;
    newstart = 1;
    isgamestart = 1;

    clearCanvas();
    drawStart();
}

// 랜덤한 블록 생성
function generateRandomPiece() {
    const pieces = [
        {
            shape: [
                [1, 1],
                [1, 1]
            ],
            color: 'cyan'
        },
        {
            shape: [
                [1, 1, 1, 1]
            ],
            color: 'yellow'
        },
        {
            shape: [
                [1, 1, 0],
                [0, 1, 1]
            ],
            color: 'purple'
        },
        {
            shape: [
                [0, 1, 1],
                [1, 1, 0]
            ],
            color: 'lightgreen'
        },
        {
            shape: [
                [1, 1, 1],
                [0, 1, 0]
            ],
            color: 'red'
        },
        {
            shape: [
                [1, 1, 1],
                [1, 0, 0]
            ],
            color: 'blue'
        },
        {
            shape: [
                [1, 1, 1],
                [0, 0, 1]
            ],
            color: 'orange'
        }
    ];

    const randomIndex = RandomNum(array, pieces.length);
    const randomPiece = pieces[randomIndex];
    var i = 0;

    // 미리 보여줄 조각을 배열로 랜덤한 값 저장
    if(newstart == 1){
        for (i = 0; i <= 3; i++) {
            var rrandomIndex = RandomNum(array, pieces.length);
            PieceArray[i] = pieces[rrandomIndex];
        }
        newstart = 0;
    }

    //한칸 씩 당겨서 0번째는 출력, 3번째는 다시 새로운 랜덤한 값 입력
    const reusltPiece = PieceArray[0];

    for (i = 1; i <= 3; i++) {
        PieceArray[i - 1] = PieceArray[i];
    }

    PieceArray[3] = randomPiece;

    return {
        shape: reusltPiece.shape,
        color: reusltPiece.color,
        x: Math.floor((cols - reusltPiece.shape[0].length) / 2),
        y: 0
    };
}


// 중복되지 않게 랜덤한 값 출력
function RandomNum(array, count) {

    var index;

    // 원하는 배열 갯수가 되면 종료
    if (array.length == count) {
        array.length = 0;
    }

    while (1) {
        // 랜덤하게 추출
        var index = Math.floor(Math.random() * count);

        // 중복 여부를 체크
        if (array.indexOf(index) > -1) {
            continue;
        }

        array.push(index);

        break;
    }

    return index; 
}


// 블록 회전
function rotateMatrix(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const rotated = [];

    for (let col = 0; col < cols; col++) {
        const newRow = [];
        for (let row = rows - 1; row >= 0; row--) {
            newRow.push(matrix[row][col]);
        }
        rotated.push(newRow);
    }

    return rotated;
}

// 빈 그리드 생성
function createEmptyGrid(cols, rows) {
    const Ggrid = [];
    for (let row = 0; row < rows; row++) {
        Ggrid.push(Array(cols).fill(0));
    }
    return Ggrid;
}


// 블록 이동 가능한지 확인
function canMovePiece(piece, offsetX, offsetY) {
    const { shape, x, y } = piece;

    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const newX = x + col + offsetX;
                const newY = y + row + offsetY;
                if (
                    newX < 0 ||
                    newX >= cols ||
                    newY >= rows ||
                    (newY >= 0 && grid[newY][newX])
                ) {
                    return false;
                }
            }
        }
    }

    return true;
}

function submitForm() {
    // 폼의 값을 동적으로 설정
    const form = document.getElementById('myForm');
    const input = document.getElementById('maxscoreInput');
    input.value = maxscore;

    // 폼 제출
    form.submit();
}