const byte reedOne = 2; // capteur PIN digital 2 (type byte --> optimisation mémoire)
const byte led = 9; // capteur PIN digital 9 (type byte --> optimisation mémoire)
bool captOne = false; // Etat du capteur (par défault non actif)

void sendOne(){ //fonction qui passe l'état du capteur false --> true
    captOne = true;
}

void setup() {
  Serial.begin(38400); // taux de communication par default d'un module bluetooth
  pinMode(reedOne, INPUT); //Déclaration du capteur comme un module d'entrée de données
  pinMode(led, OUTPUT); digitalWrite(led, HIGH); // Déclare la LED et l'alume
  attachInterrupt(digitalPinToInterrupt(reedOne), sendOne, RISING); //L'état du capteur change false --> true si on passe d'un état bas à un état haut 
}

void loop() {
  if(captOne){ //Si l'état du capteur est a true,
    Serial.print('p'); //on envoie le char 'p',
    captOne = false; //et on remet l'état du capteur à false
  }

}
