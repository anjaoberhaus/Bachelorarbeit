#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "SenseBoxMCU.h"
#include <SD.h>

float Temperatur;

File dataFile19_08_06;

#define OLED_RESET 4
Adafruit_SSD1306 display(OLED_RESET);

HDC1080 hdc;

GPS gps;


void setup() {
  senseBoxIO.powerI2C(true);
delay(2000);
display.begin(SSD1306_SWITCHCAPVCC, 0x3D);
display.display();
delay(100);
display.clearDisplay();
  SD.begin(28);
  dataFile19_08_06 = SD.open("19_08_06.txt", FILE_WRITE);
dataFile19_08_06.close();

  hdc.begin();
  gps.begin();
}

void loop() {
  Temperatur = hdc.getTemperature();
    display.setCursor(0,0);
    display.setTextSize(1);
    display.setTextColor(WHITE,BLACK);
    display.println("Temperatur:");
    display.setCursor(0,10);
    display.setTextSize(2);
    display.setTextColor(WHITE,BLACK);
    display.println(Temperatur);
    display.setCursor(0,40);
    display.setTextSize(1);
    display.setTextColor(WHITE,BLACK);
    display.println("GPS:");
    display.setCursor(0,50);
    display.setTextSize(2);
    display.setTextColor(WHITE,BLACK);
    display.println(gps.getLatitude());
    display.setCursor(80,50);
    display.setTextSize(2);
    display.setTextColor(WHITE,BLACK);
    display.println(gps.getLongitude());
  display.display();
  dataFile19_08_06 = SD.open("19_08_06.txt", FILE_WRITE);
    delay(1000);
    dataFile19_08_06.println(Temperatur);
    dataFile19_08_06.println(gps.getLatitude(),5);
    dataFile19_08_06.println(gps.getLongitude(),5);
  dataFile19_08_06.close();

}
