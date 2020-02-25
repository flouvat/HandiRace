// PINS
const byte PinReedOne = 2;
const byte PinReedTwo = 3;
const byte PinLed     = 9;

// BOOLEANS
bool BoolReedOne = false;
bool BoolReedTwo = false;

// TIME MANAGEMENT
unsigned long TimeReedOne;
unsigned long TimeReedTwo;
unsigned long CurrentTime;
unsigned long ElapsedTime;

// INTERRUPT FUNCTIONS
void sendReedOne(){
    BoolReedOne = true;
}

void sendReedTwo(){
    BoolReedTwo = true;
}

void setup() {
  Serial.begin(115200);
  TimeReedOne = millis();
  TimeReedTwo = millis();
  pinMode(PinReedOne, INPUT);
  pinMode(PinReedTwo, INPUT);
  pinMode(PinLed, OUTPUT); digitalWrite(PinLed, HIGH);        // light up the led
  attachInterrupt(digitalPinToInterrupt(PinReedOne), sendReedOne, RISING);
  attachInterrupt(digitalPinToInterrupt(PinReedTwo), sendReedTwo, RISING); 
}

void loop() {

  if(BoolReedOne){
    CurrentTime = millis();
    ElapsedTime = CurrentTime - TimeReedOne;
    TimeReedOne = CurrentTime;
    Serial.print("1:");
    Serial.print(ElapsedTime);
    Serial.print(';');
    BoolReedOne = false;
  }
  if(BoolReedTwo){
    CurrentTime = millis();
    ElapsedTime = CurrentTime - TimeReedTwo;
    TimeReedTwo = CurrentTime;
    Serial.print("2:");
    Serial.print(ElapsedTime);
    Serial.print(';');
    BoolReedTwo = false;
  }
}
