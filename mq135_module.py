from adc_module import ADC
from config_module import Configuration
import os
import math

class MQ135:
    def __init__(self):
        project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        config_file_path = os.path.join(project_dir, 'config.ini')
        self.config = Configuration(config_file_path)

        print("Started MQ135")
        self.adc_module = ADC()
    
    def get_gas_concentration(self):
        voltage = self.adc_module.voltage()
        print(voltage)
        if voltage < 1:
            return "Good"
        elif voltage >= 1 and voltage <= 2:
            return "Moderate"
        else:
            return "Bad"