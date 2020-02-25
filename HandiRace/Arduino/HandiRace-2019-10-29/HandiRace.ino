/*
 Motor   Direction    Forward   Backward  Speed   Speed range
          
  M1        4           LOW       HIGH      3       0-255
          
  M2        12          HIGH      LOW       11      0-255
          
  M3        8           LOW       HIGH      5       0-255
          
  M4        7           HIGH      LOW       6       0-255
*/


const byte reedOne = 2;
const byte reedTwo = 3;
bool captOne = false;
bool captTwo = false;

/*
const byte analogPinPotent = A0;
int valeurPotent;
const byte motorDir = 8;
const byte motorSpd = 5;
int vitesseRotation;
*/

void sendOne(){
    captOne = true;
}

void sendTwo(){
    captTwo = true;
}

void setup() {
  Serial.begin(38400);
  pinMode(reedOne, INPUT);
  pinMode(reedTwo, INPUT);
  //pinMode(13, OUTPUT); digitalWrite(13, HIGH);
  //pinMode(motorDir, OUTPUT);
  //pinMode(motorSpd, OUTPUT);
  attachInterrupt(digitalPinToInterrupt(reedOne), sendOne, RISING);
  attachInterrupt(digitalPinToInterrupt(reedTwo), sendTwo, RISING); 
}

void loop() {
  if(captOne){
    Serial.print('p');
    captOne = false;
  }
  if(captTwo){
    Serial.print('m');
    captTwo = false;
  }
  
  /*
  valeurPotent = analogRead(analogPinPotent);
  vitesseRotation = valeurPotent/4;
  
  digitalWrite(motorDir, HIGH);
  analogWrite(motorSpd, vitesseRotation);
  */
}
