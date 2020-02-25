const byte reedOne = 2;
const byte reedTwo = 3;
const byte led     = 9;
bool captOne = false;
bool captTwo = false;


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
}
