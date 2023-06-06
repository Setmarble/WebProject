const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

/*----------------------------선언부------------------------*/

const player = {
	x: 120,
	y: canvas.height / 2,		//플레이어 초기위치
	radius: 10,		//플레이어 반지름
	speed: 5,		//이동속도
	color: "blue",		//색
	damage: 1,		//공격 데미지
	life: 10,		//목숨
	invincible: false		//무적상태 여부
}; //player객체 선언

const boss = {
	x: canvas.width - 240,
	y: canvas.height / 2 - 40,		//보스 초기위치
	radius: 30,		//보스 반지름
	hp: 4500,		//보스 체력
	xspeed: 4,
	yspeed: 4		//보스 이동속도
};	//보스객체 선언

const keys = {
	up: false,
	down: false,
	left: false,
	right: false
};	//키 눌림 여부 판단 객체

var gamestart = false;	//게임 시작여부
var score = 0;		//점수
var target = 500;		//보스페이즈까지 목표 몹수
var bullets = [];		//공격 배열
var mobs = [];		//몹 배열
var items = [];		//아이템 배열
var attacks = [];		//보스 공격 배열
var isfired = false;		//사격중 여부
var fireInterval = null;
var interval = null;

/*----------------------------------------------------------*/
/*------------------------이벤트처리------------------------*/

document.addEventListener("keydown", keyDownHandler); //키다운 이벤트 리스너 등록
document.addEventListener("keyup", keyUpHandler); //키업 이벤트 리스너 등록

function keyDownHandler(e) {
	switch (e.keyCode) {
		case 37:
			keys.left = true;
			break;
		case 38:
			keys.up = true;
			break;
		case 39:
			keys.right = true;
			break;
		case 40:
			keys.down = true;
			break;		//상하좌우 키에 따른 이동
		case 17:
			if (!isfired) {
				fireInterval = setInterval(function () {
					bullets.push({
						x: player.x + 13,
						y: player.y
					});
				}, 200);
			}
			isfired = true;	//컨트롤 누를시, 사격중이 아니라면 bullets배열에 bullet 하나를 넣음
			break;
		case 32:
			if (!gamestart) {
				startGame();
			}
			break;	//스페이스바 누르면 게임 시작
	}
}

function keyUpHandler(e) {
	switch (e.keyCode) {
		case 37:
			keys.left = false;
			break;
		case 38:
			keys.up = false;
			break;
		case 39:
			keys.right = false;
			break;
		case 40:
			keys.down = false;
			break;
		case 17:
			clearInterval(fireInterval);
			isfired = false;
			break;
	}
}		//키업 핸들러

/*----------------------------------------------------------*/
/*------------------------몹/보스생성------------------------*/

function createMob() {
	var rndmobvar = Math.floor(Math.random() * 100);
	const enermy = {
		x: canvas.width,
		y: Math.floor(Math.random() * (canvas.height - 10)) + 10,
		speed: Math.floor(Math.random() * 12) + 5,
		radius: 10,
		hp: 5
	};
	mobs.push(enermy);
}		//몹 생성함수

function moveMobs() {
	for (var i = 0; i < mobs.length; i++) {
		const mob = mobs[i];
		mob.x -= mob.speed;		//배열 내의 몹을 왼쪽으로 이동
		if (mob.x < 0) {
			mobs.splice(i, 1);
			i--;		//왼쪽 끝 도달시 그 몹은 배열에서 삭제시킴
		}
	}
}		//몹 이동 함수 

function createBossAttack() {
	var speed_x = Math.floor(Math.random() * 5) + 3, speed_y = Math.floor(Math.random() * 5) + 3	//보스 탄막 공격 속도, x,y 별 랜덤한 이동속도
	var c = Math.floor(Math.random() * 100);
	if (c >= 25 && c < 50) {
		speed_x = -speed_y;
	} else if (c >= 50 && c < 75) {
		speed_x = -speed_x;
	} else if (c >= 75 && c < 100) {
		speed_x = -speed_x;
		speed_y = -speed_y;
	}			//탄막이 사방팔방 흩뿌려지게 랜덤으로 변위 조정

	const bossatt = {
		x: boss.x,
		y: boss.y,		//첫 위치는 보스위치에서 시작
		speed_x: speed_x,
		speed_y: speed_y,		//위에서 설정된 탄막 이동속도
		radius: 5,		//탄막 반지름
		bounce: Math.floor(Math.random() * 2) + 3		//탄막이 화면에서 얼마나 튕길수 있는지 랜덤수
	};		//탄막 객체

	attacks.push(bossatt);
}		//보스 탄막 공격 함수

setInterval(() => {
	if (attacks.length < 40) {
		createBossAttack();
	}
}, 300);	//탄막이 40개가 안되면 계속 공격

function moveAttacks() {
	for (var i = 0; i < attacks.length; i++) {
		const att = attacks[i];
		att.x += att.speed_x;
		att.y += att.speed_y;		//탄막 배열 내 탄막들 이동

		if (att.x + att.radius > canvas.width || att.x - att.radius < 0) {
			att.speed_x = -att.speed_x;
			att.bounce--;
		}
		if (att.y + att.radius > canvas.height || att.y - att.radius < 0) {
			att.speed_y = -att.speed_y;
			att.bounce--;
		}		//벽에 춛동시 이동을 반대로하고, 튕길수 있는 횟수 1 감소

		if (att.bounce <= 0) {
			attacks.splice(i, 1);
			i--;
		}		//튕길수 있는 횟수가 다되면 그 탄막은 삭제
	}
}	//탄막 이동 함수

function moveBoss() {
	boss.x -= boss.xspeed * 2;
	boss.y += boss.yspeed;		//보스 이동

	if (boss.x + boss.radius > 1100 || boss.x - boss.radius < 400) {
		boss.xspeed = -boss.xspeed;
	}

	if (boss.y + boss.radius > canvas.height - 100 || boss.y - boss.radius < 100) {
		boss.yspeed = -boss.yspeed;
	}		//정해진 범위내에서 움직이고, 범위를 벗어나려 하면 이동을 반대로 시킴
}	//보스 이동 함수

function dropItem(mob) {
	var rndvar = Math.floor(Math.random() * 100);	//랜덤 수

	if (rndvar < 20) {
		items.push({
			x: mob.x,
			y: mob.y,
			radius: 5
		})
	} else {
		return;
	}		//20%확률로 아이템을 떨구고, 아니면 그냥 반환
}		//드롭 아이템 생성 함수

/*----------------------------------------------------------*/
/*-------------------------충돌처리-------------------------*/

function collisionDetectPM(player, mob) {
	if (player.invincible) {
		return false;
	}		//플레이어가 무적이면 그냥 리턴

	const distance = Math.sqrt(Math.pow(player.x - mob.x, 2) + Math.pow(player.y - mob.y, 2));
	if (distance < player.radius + mob.radius) {
		return true;
	}
	return false;		//플레이어와 몹사이 거리를 계산해서, 부딪혔다면 true, 아니면 false
}		//플레이어와 몹끼리의 충돌판정 함수

function collisionDetectMB(mob, bullet) {
	const distance = Math.sqrt(Math.pow(mob.x - bullet.x, 2) + Math.pow(mob.y - bullet.y, 2));
	if (distance < mob.radius + 3) {
		mob.hp -= player.damage;
		if (mob.hp <= 0) {
			return true;
		}	//충돌한 몹의 체력은 데미지만큼 감소하고, 체력이 0이하가되면 true
	}
	return false;
}		//플레이어 공격과 몹끼리의 충돌판정 함수

function collisionDetectBB(boss, bullet) {
	const distance = Math.sqrt(Math.pow(bullet.x - boss.x, 2) + Math.pow(bullet.y - boss.y, 2));
	if (distance < boss.radius + 3) {
		return true;
	}
	return false;
}		//보스와 플레이어 공격끼리의 충돌판정

function collisionDetectPB(player, boss) {
	const distance = Math.sqrt(Math.pow(player.x - boss.x, 2) + Math.pow(player.y - boss.y, 2));
	if (distance < player.radius + boss.radius) {
		return true;
	}
	return false;
}		//플레이어와 보스의 충돌판정

function collisionDetectPI(player, item) {
	const distance = Math.sqrt(Math.pow(player.x - item.x, 2) + Math.pow(player.y - item.y, 2));
	if (distance < player.radius + item.radius) {
		return true;
	}
	return false;
}		//플레이어와 아이템끼리의 충돌판정

function collisionDetectPA(player, att) {
	const distance = Math.sqrt(Math.pow(player.x - att.x, 2) + Math.pow(player.y - att.y, 2));
	if (distance < player.radius + att.radius - 2) {
		return true;
	}
	return false;
}		//플레이어와 보스 탄막 공격끼리의 충돌판정

/*----------------------------------------------------------*/
/*--------------------------그리기--------------------------*/

function drawBullet(bullet) {
	if (bullet.x > canvas.width) {
		return;
	}		//오른쪽 끝으로 도달시 return
	ctx.beginPath();
	ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
	ctx.fillStyle = "black";
	ctx.fill();
	ctx.closePath();
}		//플레이어 공격을 그리는 함수

function drawMobs(mob) {
	var mobcolor;
	ctx.beginPath();
	ctx.arc(mob.x, mob.y, mob.radius, 0, Math.PI * 2);

	if (mob.hp <= 1)
		mobcolor = "yellow";
	else if (mob.hp <= 3)
		mobcolor = "orange";
	else
		mobcolor = "red";		//체력에 따른 몹 색 변경

	ctx.fillStyle = mobcolor;
	ctx.fill();
	ctx.closePath();
}		//몹을 그리는 함수

function drawAttacks(att) {
	ctx.beginPath();
	ctx.arc(att.x, att.y, att.radius, 0, Math.PI * 2);
	ctx.fillStyle = "black";
	ctx.fill();
	ctx.closePath();
}		//보스 탄막패턴을 그리는 함수

function drawItem(item) {
	ctx.beginPath();
	ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
	ctx.fillStyle = "green";
	ctx.fill();
	ctx.closePath();
}		//아이템을 그리는 함수

function drawPlayer() {
	ctx.beginPath();
	ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
	ctx.fillStyle = player.color;
	ctx.fill();
	ctx.closePath();
}		//플레이어를 그리는 함수

function drawBoss() {
	ctx.beginPath();
	ctx.arc(boss.x, boss.y, 40, 0, Math.PI * 2);
	ctx.fillStyle = "red";
	ctx.fill();
	ctx.closePath();
}		//보스를 그리는 함수

function drawText() {
	ctx.beginPath();
	ctx.font = "30px Arial";
	ctx.fillStyle = "black";
	ctx.textAlign = "center";
	ctx.textAlign = "left";
	ctx.fillText("Life : " + player.life, 10, 30);
	ctx.textAlign = "right";
	ctx.fillText("Score : " + score, canvas.width - 10, 30);
	ctx.closePath();
}		//위쪽에 목숨, 점수를 그리는 함수

function drawStart() {
	ctx.beginPath();
	ctx.font = "30px Arial";
	ctx.fillStyle = "black";
	ctx.textAlign = "center";
	ctx.fillText("Space를 누르면 시작", canvas.width / 2, canvas.height / 2);			/////최고점수 만들기
	ctx.closePath();
}		//시작 전 메시지를 그리는 함수

function drawBossHP() {
	ctx.beginPath();
	ctx.font = "30px Arial";
	ctx.fillStyle = "black";
	ctx.fillText("BOSS HP : " + boss.hp, canvas.width / 2 + 70, 30);
}		//보스 출현시 보스 체력을 그리는 함수

/*----------------------------------------------------------*/
/*-------------------------메인함수-------------------------*/

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	drawPlayer();		//플레이어 표시
	drawText();		//정보 텍스트 표시

	if (keys.right && player.x < canvas.width - 10) {
		player.x += 5;
	} else if (keys.left && player.x > 10) {
		player.x -= 5;
	}
	if (keys.down && player.y < canvas.height - 10) {
		player.y += 5;
	} else if (keys.up && player.y > 10) {
		player.y -= 5;
	}		//플레이어 키보드 입력이 캔버스 밖으로 빠져나가지 않도록 보정


	for (var i = 0; i < bullets.length; i++) {
		bullets[i].x += Math.floor(Math.random() * 10) + 8;
		drawBullet(bullets[i]);
	}		//배열내의 불릿들을 그림

	for (var i = 0; i < mobs.length; i++) {
		drawMobs(mobs[i]);		//몹 배열내의 몹을 그림
		if (collisionDetectPM(player, mobs[i]) && !player.invincible) {
			player.life -= 1;		//플레이어와 몹이 충돌하면 목숨을 하나 내림
			player.invincible = true;		//무적으로 변경
			setTimeout(() => {
				player.invincible = false;
			}, 2000);		//2초후 무적이 풀리게 만듬
			mobs.splice(i, 1);
			i--;		//충돌한 몹을 배열에서 삭제
		}
	}
	moveMobs();		//몹 이동함수 실행

	for (var i = 0; i < mobs.length; i++) {
		const m = mobs[i];
		for (var j = 0; j < bullets.length; j++) {
			const b = bullets[j];

			if (!m || !b) continue;

			if (collisionDetectMB(m, b)) {		//플레이어 공격과 몹이 충돌하고, 몹의 체력이 0 이하가 될경우
				mobs.splice(i, 1);
				bullets.splice(j, 1);		//충돌한 몹과 총알을 배열에서 제거
				i--;
				j--;
				if(score < 500){
					score+=10;		//점수 증가
				}
				if (player.damage < 10) {
					dropItem(m);
				}		//플레이어 데미지 상한은 10으로 두고, 그 상한까지는 몹이 죽은 위치에서 아이템이 드롭되게 함
			}
		}
	}

	for (var i = 0; i < items.length; i++) {
		drawItem(items[i]);		//아이템 배열내의 아이템을 그림
		if (collisionDetectPI(player, items[i])) {		//아이템과 플레이어 충돌 판정
			player.damage++;
			items.splice(i, 1);
			i--;
		}
	}		//몹에서 떨궈진 아이템에 충돌하면, 그 아이템을 없애고 플레이어의 데미지를 올림

	if (score >= target) {		//아직 목표가 안되서 일반몹을 잡아야될 경우											/////수정
	//몹 카운트를 다채워서 보스페이즈 시작
		drawBoss();
		drawBossHP();		//보스와 보스 체력정보 그림
		moveAttacks();
		moveBoss();		//보스 탄막 공격과 보스가 움직이는 함수

		for (var i = 0; i < attacks.length; i++) {
			drawAttacks(attacks[i]);		//보스 탄막 배열내의 탄막들을 그림
			if (collisionDetectPA(player, attacks[i]) && !player.invincible) {		//탄막 공격과 플레이어가 충돌하고 플레이어가 무적이 아닐시
				player.life -= 1;		//목숨을 하나 제거
				player.invincible = true;		//무적상태
				setTimeout(() => {
					player.invincible = false;
				}, 2000);		//2초후 무적이 풀림
				attacks.splice(i, 1);
				i--;		//충돌한 탄막을 배열에서 제거
			}
		}

		if (collisionDetectPB(player, boss)) {		//보스와 플레이어가 충돌했을시
			if (!player.invincible) {
				player.life -= 1;
				player.invincible = true;
				setTimeout(() => {
					player.invincible = false;
				}, 2000);		//충돌시 플레이어 목숨을 하나 감소시키고, 무적판정으로 바꾼뒤 2초후 무적해제
			}
		}

		for (var i = 0; i < bullets.length; i++) {
			if (collisionDetectBB(boss, bullets[i])) {		//보스와 플레이어 공격이 충돌시
				bullets.splice(i, 1);
				i--;
				boss.hp -= player.damage;		//충돌한 공격은 배열에서 제거하고, 보스 체력을 플레이어 데미지만큼 감소
				if (boss.hp <= 0) {		//보스 피가 0이하일시
					boss.hp = 0;
					score = (4500 - boss.hp) + 500 + player.life * 500;
					alert("YOU WIN \nScore :" + score);
					location.reload();
					return;		//게임 종료
				}
			}
		}
	}

	if(score >= target) {
		score = (4500 - boss.hp) + 500 + player.life * 500;
	}

	if (player.life <= 0) {
		alert("Game Over \nScore : " + score);
		alert.center
		location.reload();
		return;
	}		//플레이어 목숨이 다할시, 게임 종료

	requestAnimationFrame(draw);
}

if (!gamestart) {
	drawStart();
}		//게임이 시작 안했을시, 메시지를 그리는 함수실행

function startGame() {
	gamestart = true;

	if (score < target) {
		interval = setInterval(createMob, 500);
	}	//target전까지 몹 계속 생성

	draw();
}		//스페이스바를 누르면 게임실행 변수를 true로 바꾸고, draw함수 실행