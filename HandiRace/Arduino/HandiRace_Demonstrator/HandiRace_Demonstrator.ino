/*
 Motor   Direction    Forward   Backward  Speed   Speed range
          
  M1        4           LOW       HIGH      3       0-255
          
  M2        12          HIGH      LOW       11      0-255
          
  M3        8           LOW       HIGH      5       0-255
          
  M4        7           HIGH      LOW       6       0-255
*/


const byte reedOne = 2;
const byte reedTwo = 3;
const byte led     = 9;
bool captOne = false;
bool captTwo = false;

/* M3
const byte analogPinPotentM3 = A0;
int valeurPotentM3;
int vitesseRotationM3;
const byte M3Dir = 8;
const byte M3Spd = 5;
*/

/* M4
const byte analogPinPotentM4 = A1;
int valeurPotentM4;
int vitesseRotationM4;
const byte M4Dir = 7;
const byte M4Spd = 6;
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
  pinMode(led, OUTPUT); digitalWrite(led, HIGH);        // light up the led
  //pinMode(13, OUTPUT); digitalWrite(13, HIGH);        // power for the potentM3
  //pinMode(M3Dir, OUTPUT); pinMode(M3Spd, OUTPUT);
  //pinMode(M4Dir, OUTPUT); pinMode(M4Spd, OUTPUT);
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

  delay(100);
  
  /* M3
  valeurPotentM3 = analogRead(analogPinPotentM3);
  vitesseRotationM3 = valeurPotentM3/4;
  
  digitalWrite(M3Dir, HIGH);
  analogWrite(M3Spd, vitesseRotationM3);
  */

  /* M4
  valeurPotentM4 = analogRead(analogPinPotentM4);
  vitesseRotationM4 = valeurPotentM4/4;
  
  digitalWrite(M4Dir, HIGH);
  analogWrite(M4Spd, vitesseRotationM4);
  */
}
