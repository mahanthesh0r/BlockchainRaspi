import RPi.GPIO as GPIO 
import time 
GPIO.setmode(GPIO.BOARD) 
GPIO.setup(12, GPIO.OUT) 
p = GPIO.PWM(12, 50) 
p.start(12.5) 
time.sleep(1) #sleep 1 second
p.stop()
GPIO.cleanup()
