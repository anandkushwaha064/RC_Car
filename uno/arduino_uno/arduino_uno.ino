#include <AFMotor.h>
#include <NewPing.h>
#define TRIG_PIN1 A0
#define ECHO_PIN1 A1
#define TRIG_PIN2 A2
#define ECHO_PIN2 A3

#define HORN_PIN 2  // horn connected to digital pin D2

AF_DCMotor motor1(1, MOTOR12_1KHZ);
AF_DCMotor motor2(2, MOTOR12_1KHZ);
AF_DCMotor motor3(3, MOTOR34_1KHZ);
AF_DCMotor motor4(4, MOTOR34_1KHZ);

NewPing sonar1(TRIG_PIN1, ECHO_PIN1, 100);
NewPing sonar2(TRIG_PIN2, ECHO_PIN2, 100);

char command = 'F';
char lastcommand = command;
char directionCommands[] = { 'F', 'B', 'L', 'R', 'S' };

int sp = 0;
const int backLight = 10;
int distance = 100;


void setup() {
  Serial.begin(9600);
  pinMode(backLight, OUTPUT);
  pinMode(HORN_PIN, OUTPUT);  // horn pin as output
}

void loop() {
  if (Serial.available()) {

    if (isDigit(Serial.peek())) {   // if the next char is a digit
      int num = Serial.parseInt();  // grab whole number like 70
      // get the last number for stream
      num=num%10;
      
      Serial.print("Speed number received: ");
      Serial.println(num);
      speedchange(num);
    } else {
      command = Serial.read();  // otherwise normal char command
      Serial.print("Command: ");
      Serial.println(command);
      if (lastcommand != command) {
        for (int i = 0; i < 5; i++) {
          if (command == directionCommands[i]) {
            lastcommand = command;  // update last command only if it's F/B/L/R/S
            break;
          }
        }
      }
      checkcase(command);
    }
  }
}

int readPing1() {
  int cm = sonar1.ping_cm();
  if (cm == 0)
    cm = 250;
  return cm;
}

int readPing2() {
  int cm = sonar2.ping_cm();
  if (cm == 0)
    cm = 250;
  return cm;
}


void checkcase(char command) {
  switch (command) {
    case 'F':
      forward();
      break;
    case 'B':
      back();
      break;
    case 'L':
      left();
      break;
    case 'R':
      right();
      break;
    case 'S':
      Stop();
      break;
    case 'H':
      digitalWrite(HORN_PIN, HIGH);  // turn horn OFF
      break;
    case 'U':
      digitalWrite(backLight, HIGH);
      break;
    case 'u':
      digitalWrite(backLight, LOW);
      break;
  }
  if (command != 'H') {
    digitalWrite(HORN_PIN, LOW);  // turn horn OFF
  }
}
void speedchange(int spe) {
  Serial.print("speed ");
  Serial.println(spe);
  if (spe < 0 || spe > 9) { return; }

  if (spe == 0) {
    Stop();
    return;
  }
  // to cover 10 do ++
  spe++;
  sp = (255 * spe) / 10;
  Serial.println("Changing speed");
  Serial.println(sp);
  // To apply new speed to all wheels
  checkcase(lastcommand);
}

void forward() {
  if (sp == 0) {
    speedchange(100);
  }
  if (readPing1() > 50) {
    motor1.setSpeed(sp);  //Define maximum velocity
    motor1.run(FORWARD);  //rotate the motor clockwise
    motor2.setSpeed(sp);  //Define maximum velocity
    motor2.run(FORWARD);  //rotate the motor clockwise
    motor3.setSpeed(sp);  //Define maximum velocity
    motor3.run(FORWARD);  //rotate the motor clockwise
    motor4.setSpeed(sp);  //Define maximum velocity
    motor4.run(FORWARD);  //rotate the motor clockwise
    digitalWrite(backLight, LOW);
  } else {
    Stop();
  }
}

void back() {
  if (readPing2() > 50) {
    motor1.setSpeed(sp);   //Define maximum velocity
    motor1.run(BACKWARD);  //rotate the motor anti-clockwise
    motor2.setSpeed(sp);   //Define maximum velocity
    motor2.run(BACKWARD);  //rotate the motor anti-clockwise
    motor3.setSpeed(sp);   //Define maximum velocity
    motor3.run(BACKWARD);  //rotate the motor anti-clockwise
    motor4.setSpeed(sp);   //Define maximum velocity
    motor4.run(BACKWARD);  //rotate the motor anti-clockwise
  } else {
    Stop();
  }
}

void left() {
  int sleepOnLeft = (sp > 100) ? 100 : sp;

  motor1.setSpeed(sleepOnLeft);  //Define maximum velocity
  motor1.run(BACKWARD);          //rotate the motor anti-clockwise
  motor2.setSpeed(sleepOnLeft);  //Define maximum velocity
  motor2.run(BACKWARD);          //rotate the motor anti-clockwise
  motor3.setSpeed(sleepOnLeft);  //Define maximum velocity
  motor3.run(FORWARD);           //rotate the motor clockwise
  motor4.setSpeed(sleepOnLeft);  //Define maximum velocity
  motor4.run(FORWARD);           //rotate the motor clockwis
}

void right() {
  int sleepOnRight = (sp > 100) ? 100 : sp;
  motor1.setSpeed(sleepOnRight);  //Define maximum velocity
  motor1.run(FORWARD);            //rotate the motor clockwise
  motor2.setSpeed(sleepOnRight);  //Define maximum velocity
  motor2.run(FORWARD);            //rotate the motor clockwise
  motor3.setSpeed(sleepOnRight);  //Define maximum velocity
  motor3.run(BACKWARD);           //rotate the motor anti-clockwise
  motor4.setSpeed(sleepOnRight);  //Define maximum velocity
  motor4.run(BACKWARD);           //rotate the motor anti-clockwise
}

void Stop() {
  motor1.setSpeed(0);   //Define minimum velocity
  motor1.run(FORWARD);  //stop the motor when release the button
  motor2.setSpeed(0);   //Define minimum velocity
  motor2.run(FORWARD);  //rotate the motor clockwise
  motor3.setSpeed(0);   //Define minimum velocity
  motor3.run(FORWARD);  //stop the motor when release the button
  motor4.setSpeed(0);   //Define minimum velocity
  motor4.run(FORWARD);  //stop the motor when release the button
}
