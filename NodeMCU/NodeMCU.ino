#include <SoftwareSerial.h>
SoftwareSerial bluetoothSerial(13, 15); 
// Tx pin of the bluetooth module must be connected to Rx pin on arduino
// Rx pin of the bluetooth module must be connected to Tx pin on arduino
const int head=12;
const int left=4;
const int right=5;

int lightsence = 14;
int trig=2;
int input=0;
int duration1;
int distance1;
int distance;
char com[20];
String inputString;
char command;
char inChar;

void setup()
{
      bluetoothSerial.begin(9600);
      Serial.begin(115200);
      pinMode(head,OUTPUT);
      pinMode(left,OUTPUT);
      pinMode(right,OUTPUT);
      pinMode(trig,OUTPUT);
      pinMode(input,INPUT);
      pinMode(lightsence,INPUT_PULLUP);
}
  
void loop(){
      if(bluetoothSerial.available())
      {       
               inChar = bluetoothSerial.read(); //read the input 
                  if(checkMotorcommand(inChar)==0)
                   Serial.write(inChar);
                   Digital(inChar);
      }
     if(Serial.available())
     {
        char command=Serial.read();
        Digital(command); 
     }       
  
  headLights();
  }

  
int checkMotorcommand(char inChar)
  {
  int val=1;
  int sp=inChar;
    if(inChar=='S'||inChar=='L'||inChar=='R'||inChar=='B'||inChar=='F'||inChar=='H'||inChar=='G'||inChar=='J'||inChar=='I'||inChar=='u'||inChar=='U')
      {
      val=0;
      }
      else if(sp>=48&&sp<=57)
      {
      val=0;
      }
    return val;
  }

void Digital(char command) 
    {
    switch(command)
    {
    case 'W':
     digitalWrite(head,HIGH);
    break;
    case 'w':
     digitalWrite(head,LOW);
    break;
    case 'R':
     digitalWrite(right,HIGH);
    break;
    case 'L':
     digitalWrite(left,LOW);
    break;
    default:
     digitalWrite(right,LOW);
     digitalWrite(left,LOW);
    break;
    }
}

void headLights()
{
  char val=digitalRead(lightsence);
         if(val==HIGH)
        {
           Digital('w');
        }
        else
        {
           Digital('W');
        }
}

 
