let maxscore=0;
      
      const canvas = document.getElementById("canvas"); // 캔버스 생성
      const context = canvas.getContext("2d"); // 그림 그리기 위해 2d 게임 context값 가져오기

      //키보드 눌렀을 때 이벤트 받기
      document.addEventListener("keydown", keyDownHandler, false);
      document.addEventListener("keyup", keyUpHandler, false);


      // 웹 브라우저가 열렸을 때
      window.onload = () => {
        wait();
      }

      //게임시작 전
      function wait() {
        context.clearRect(0, 0, canvas.width, canvas.height); //캔버스 영역 지우기
        context.font = "36px Arial";
        context.fillText("비 피하기", canvas.width / 2 - 90, canvas.height / 2 - 50);
        context.fillStyle = "skyblue";        //시작전 글자색
        context.fillText("게임을 시작하려면 1번을 누르세요", canvas.width / 2 - 90, canvas.height / 2);
        context.fillText("Your max score is "+maxscore,canvas.width / 2 - 90, canvas.height / 2+50)
      }

      // 키 입력 시
      function keyDownHandler(e) {
        if (e.key == "ArrowRight") {
          rightPressed = true;
        } else if (e.key == "ArrowLeft") {
          leftPressed = true;
        } else if (e.key == "Enter") {
          wait();
        } else if (e.key == 1) {
          raincount = 12;
          rainspeed = 5;
          difficulty = "easy";
          gamestart = 0;
          gameStart();
        }
      }

      // 키에서 손 땔 때
      function keyUpHandler(e) {
        if (e.key == "ArrowRight") {
          rightPressed = false;
        } else if (e.key == "ArrowLeft") {
          leftPressed = false;
        }
      }

      // 플레이어
      class Player {
        constructor() {
          this.x = rectX,
            this.y = 660,
            this.width = rectWidth,
            this.height = rectHeight
        }
        draw() {
          context.fillStyle = "black"
          context.fillRect(this.x, this.y, this.width, this.height);
        }
      }

      // 비 
      class Rain {
        constructor() {
          this.x = Math.random() * canvas.width,
          this.y = 0;
          this.direction = 0;
          this.width = 5;
          this.height = 25;
          this.isObstacle = true; //장애물인지 확인
        }
        draw() {
          context.fillStyle = "LightSkyBlue";
          context.fillRect(this.x, this.y, this.width, this.height);
        }
      };

      // 하트
      class Heart {
        constructor() {
          this.x = Math.random() * canvas.width;
          this.y = 0;
          this.direction = 0;
          this.radius = 10;
          this.isObstacle = false;
        }
        draw() {
          context.beginPath();
          context.fillStyle = 'pink';
          context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
          context.fill();
        }
      };

      // 남은 생명
      function life() {
        context.beginPath();
        context.fillStyle = 'pink';
        context.arc(30, 30, 15, 0, 2 * Math.PI);
        context.fill();

        context.fillStyle = "gray";
        context.font = "20px Arial";
        context.fillText(" X " + lifes, 50, 38);
      };

      // 현재 점수
      function scoreView() {
        context.fillStyle = "gray";
        context.font = "20px Arial";
        context.fillText("점수 : " + score, 870, 30);
      }

      // 선택한 난이도
      function difficultyView() {
        context.fillStyle = "gray";
        context.font = "20px Arial";
        context.fillText(difficulty, canvas.width / 2 - 20, 30);
      }


      // 변수 설정
      var gamestart = 0;
      var difficulty; // 난이도
      var score ; // 점수
      var lifes = 0; // 생명
      var rains = [] // 비, 하트 여러개 생성
      var rectX = 0 // 플레이어 x 좌표
      var rectWidth = 40, rectHeight = 40; // 플레이어 도형 크기
      var rightPressed = false; //방향키 오른쪽
      var leftPressed = false; // 방향키 왼쪽
      var timer = 0; // 실행 횟수

      // 게임 시작
      function gameStart() {
        // 변수 초기화
        score =0; // 점수
        lifes = 3; // 생명
        rains = [];
        rectX = 0;
        timer = 0;
        raincount = 12; // 초기 raincount 값
        rainspeed = 5; // 초기 rainspeed 값
      

        function setdiffuculty(){
          var rain = new Rain();
          rains.push(rain);
          var difficulty=250*1000/(1000+score);
          if(gamestart == 0){
            setTimeout(setdiffuculty,difficulty);
          }
        }
        //그리기
        function draw() {
          timer++;
          context.clearRect(0, 0, canvas.width, canvas.height);

          // 남은 생명
          life();
          // 점수 표시
          scoreView();

          //플레이어 생성
          var player = new Player();
          player.draw();

          if (rightPressed && rectX < canvas.width - rectWidth) {
            rectX += 8;
          } else if (leftPressed && rectX > 0) {
            rectX -= 8;
          }


          // 1초 지날 때 마다 점수 +
          if (timer % 50 === 0) {
            score+=20;
          }

          //비 y위치 변경
          rains.forEach((a, i, o) => {
            if (a.y > canvas.height) {
              o.splice(i, 1);
            }

            crash(player, a, i, o);

            a.y += rainspeed;
            a.draw();
          });

     

        // 증가하는 raincount와 rainspeed
          rainspeed = 5 + score * 0.004;
        }

        // 게임 시작, 20ms (0.02초)마다 실행
        let game=setInterval(draw, 20);
        setTimeout(setdiffuculty,0);

        //충돌 확인
        function crash(player, object, index, array) {
          var ygap = player.y - player.height - object.y;
          // 오브젝트와 플레이어가 닿았을 때
          if (player.x < object.x && object.x < player.x + player.width && ygap < 0) {
            // 닿은게 비(장애물)일 때
            if (object.isObstacle) {
              lifes--; // 생명 -1
              array.splice(index, 1);
            }

            //생명이 0개일 때
            if (lifes == 0) {
              clearInterval(game,setdiffuculty);
              gamestart = 1;
              gameOver();
            }
          }
        }
      }



      //게임오버
      function gameOver() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "black";
  context.font = "36px Arial";
  context.fillText("GAMEOVER", canvas.width / 2 - 100, canvas.height / 2 - 10);
  context.fillText("점수 : " + score, canvas.width / 2 - 100, canvas.height / 2 + 40);
  context.fillStyle = "gray";
  context.font = "32px Arial";
  context.fillText("다시하기 >> Enter", canvas.width / 2 - 100, canvas.height / 2 + 120);

  if (score > maxscore) {
    maxscore = score;
  }
  context.fillText("Your max score is " + maxscore, canvas.width / 2 - 100, canvas.height / 2 + 180);
}
function submitForm() {
    // ���� ���� �������� ����
    const form = document.getElementById('myForm');
    const input = document.getElementById('maxscoreInput');
    input.value = maxscore;

    // �� ����
    form.submit();
}