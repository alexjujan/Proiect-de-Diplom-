import time
from api_module import API
from htu21_module import HTU21
from mq135_module import MQ135

class Main:
    def __init__(self):
        self.htu21 = HTU21()
        self.mq135 = MQ135()
        self.api = API()
        self.running = True
    def run(self):
        print("Started main.")
        while self.running:
            temperature = self.htu21.read_temp()
            humidity = self.htu21.read_humidity()
            airQ = self.mq135.get_gas_concentration()
            print("\n temp ", temperature,"\n hum ", humidity,"\nairquality", airQ)
            self.api.send_data(temperature, humidity, airQ) 
            time.sleep(2)
    def stop(self):
        self.running = False

main = Main()
try:
    main.run()
except KeyboardInterrupt:
    print("Stopping...")
    main.stop()