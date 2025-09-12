#include <AFMotor.h>  
#include <NewPing.h>
#define TRIG_PIN1 A0 
#define ECHO_PIN1 A1 
#define TRIG_PIN2 A2 
#define ECHO_PIN2 A3

AF_DCMotor motor1(1, MOTOR12_1KHZ); 
AF_DCMotor motor2(2, MOTOR12_1KHZ); 
AF_DCMotor motor3(3, MOTOR34_1KHZ);
AF_DCMotor motor4(4, MOTOR34_1KHZ);

NewPing sonar1(TRIG_PIN1, ECHO_PIN1, 100); 
NewPing sonar2(TRIG_PIN2, ECHO_PIN2, 100); 

char command; 
int sp;
const int backLight = 10;
char lastcommand;
int distanceF = 0;
int distanceB =  0;
int distance = 100;
int speedSet = 0;
void setup() {
Serial.begin(115200);
pinMode(backLight,OUTPUT);
}

void loop()
{
  distanceF = 0;
  distanceB =  0;
  if(Serial.available())
  { 
    command = Serial.read(); 
    Serial.println(command);
    Stop();
    int val=command;  
    checkcase(command);
    if(val>=48&&val<=57)
    speedchange(val-48);    
  }
   
 }
 
int readPing1() { 
  int cm = sonar1.ping_cm();
  if(cm==0)
    cm = 250; 
  return cm;
}

int readPing2() { 
  int cm = sonar2.ping_cm();
  if(cm==0)
    cm = 250; 
  return cm;
}


void checkcase(char command)
{
   switch(command){
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
      Stop;
      break;
    case 'U':
     digitalWrite(backLight,HIGH);
    break;
    case 'u':
     digitalWrite(backLight,LOW);
    break;   
    } 
}
void speedchange(int spe)
{
  sp=255;
  if(spe==0)
  {
    Stop();
    }
  spe++;
  sp=(spe*sp)/10;
//  Serial.print("  ");
//  Serial.print(spe);
//  Serial.print("  ");
//  Serial.print(sp);
  //checkcase(lastcommand);
}

void forward()
{
  if(readPing1()>50)
  {
  motor1.setSpeed(sp); //Define maximum velocity
  motor1.run(FORWARD); //rotate the motor clockwise
  motor2.setSpeed(sp); //Define maximum velocity
  motor2.run(FORWARD); //rotate the motor clockwise
  motor3.setSpeed(sp);//Define maximum velocity
  motor3.run(FORWARD); //rotate the motor clockwise
  motor4.setSpeed(sp);//Define maximum velocity
  motor4.run(FORWARD); //rotate the motor clockwise
  digitalWrite(backLight,LOW);
  }
  else
  {
    Stop();
    }
}

void back()
{
   if(readPing2()>50)
  {
  motor1.setSpeed(sp); //Define maximum velocity
  motor1.run(BACKWARD); //rotate the motor anti-clockwise
  motor2.setSpeed(sp); //Define maximum velocity
  motor2.run(BACKWARD); //rotate the motor anti-clockwise
  motor3.setSpeed(sp); //Define maximum velocity
  motor3.run(BACKWARD); //rotate the motor anti-clockwise
  motor4.setSpeed(sp); //Define maximum velocity
  motor4.run(BACKWARD); //rotate the motor anti-clockwise
  }
  else
  {
    Stop();
    }
 
}

void left()
{
  motor1.setSpeed(0); //Define maximum velocity
  motor1.run(FORWARD); //rotate the motor anti-clockwise
  motor2.setSpeed((sp/4)); //Define maximum velocity
  motor2.run(FORWARD); //rotate the motor anti-clockwise
  motor3.setSpeed(sp); //Define maximum velocity
  motor3.run(FORWARD);  //rotate the motor clockwise
  motor4.setSpeed(sp); //Define maximum velocity
  motor4.run(FORWARD);  //rotate the motor clockwis
}

void right()
{
  motor1.setSpeed(sp); //Define maximum velocity
  motor1.run(FORWARD); //rotate the motor clockwise
  motor2.setSpeed(sp); //Define maximum velocity
  motor2.run(FORWARD); //rotate the motor clockwise
  motor3.setSpeed(0); //Define maximum velocity
  motor3.run(FORWARD); //rotate the motor anti-clockwise
  motor4.setSpeed((sp/4)); //Define maximum velocity
  motor4.run(FORWARD); //rotate the motor anti-clockwise
} 

void Stop()
{
  motor1.setSpeed(0); //Define minimum velocity
  motor1.run(FORWARD); //stop the motor when release the button
  motor2.setSpeed(0); //Define minimum velocity
  motor2.run(FORWARD); //rotate the motor clockwise
  motor3.setSpeed(0); //Define minimum velocity
  motor3.run(FORWARD); //stop the motor when release the button
  motor4.setSpeed(0); //Define minimum velocity
  motor4.run(FORWARD); //stop the motor when release the button
}
