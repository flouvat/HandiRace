const byte reedOne = 2;
const byte reedTwo = 3;
const byte led     = 9;
int i;
int cptOne;
int cptTwo;


void incOne(){
    cptOne++;
}

void incTwo(){
    cptTwo++;
}

void setup() {
  Serial.begin(38400);
  i = 0;
  cptOne = 0;
  cptTwo = 0;
  pinMode(reedOne, INPUT);
  pinMode(reedTwo, INPUT);
  pinMode(led, OUTPUT); digitalWrite(led, HIGH);        // light up the led
  attachInterrupt(digitalPinToInterrupt(reedOne), incOne, RISING);
  attachInterrupt(digitalPinToInterrupt(reedTwo), incTwo, RISING); 
}

void loop() {

  if(cptOne > 0){
    Serial.print('p');
    captOne--;
  }
  if(cptTwo > 0){
    Serial.print('m');
    captTwo--;
  }
}
