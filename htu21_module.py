from config_module import Configuration
import os
import time
import smbus2

class HTU21:
    def __init__(self, bus_num=1):
        project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        config_file_path = os.path.join(project_dir, 'config.ini')
        self.config = Configuration(config_file_path)
        self.settings = self.config.get_htu21_config()

        self.bus = smbus2.SMBus(bus_num)
        self.address = self.settings['I2C_ADDRESS']
        print("Started HTU21 module.")
    
    def reset(self):
        self.bus.write_byte(self.address, self.settings['SOFT_RESET'])
        time.sleep(0.05) # wait for 50ms for reset

    def read_temp(self):
        self.bus.write_byte(self.address, self.settings['TRIGGER_TEMP'])    # send temperature read command
        time.sleep(0.05) # wait for 50ms for measurement
        data = self.bus.read_i2c_block_data(self.address, self.settings['TRIGGER_TEMP'], 3) # read the temperature
        raw_temperature = (data[0] << 8) | data[1]  # combine the 2 bytes of data
        temperature = -46.85 + (175.72 * raw_temperature / 65536.0) # compute the temperature according to the formula from the datasheet
        return temperature
    
    def read_humidity(self):
        self.bus.write_byte(self.address, self.settings['TRIGGER_HUM'])    # send humidity read command
        time.sleep(0.05) # wait for 50ms for measurement
        data = self.bus.read_i2c_block_data(self.address, self.settings['TRIGGER_HUM'], 3) # read the humidity
        raw_humidity = (data[0] << 8) | data[1]  # combine the 2 bytes of data
        humidity = -6.0 + (125.0 * raw_humidity / 65536.0) # compute the humidity according to the formula from the datasheet
        return humidity