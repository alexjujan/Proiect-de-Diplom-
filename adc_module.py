from config_module import Configuration
import os
import time
from gpiozero import DigitalOutputDevice, DigitalInputDevice

class ADC:
    def __init__(self):
        project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        config_file_path = os.path.join(project_dir, 'config.ini')
        self.config = Configuration(config_file_path)
        self.settings = self.config.get_adc_config()
        self.cs = DigitalOutputDevice(self.settings['CS_PIN'])
        self.clk = DigitalOutputDevice(self.settings['CLK_PIN'])
        self.di = DigitalOutputDevice(self.settings['DI_PIN'])
        self.do = DigitalInputDevice(self.settings['DO_PIN'])
    
    def read_adc(self, channel):
        if channel < 0 or channel > 1:
            raise ValueError("Channel error")
        
        self.cs.on()    # start 
        self.clk.off()
        self.cs.off()

        send_bits = (1 << 1 | (1 if channel == 0 else 0)) << 4  # start bit and channel
        for i in range(5):
            self.di.value = bool(send_bits & 0x80)
            send_bits <<= 1
            self.clk.on()
            self.clk.off()

        # reading the response
        result = 0
        for i in range(8):
            self.clk.on()
            result <<= 1
            if self.do.value:
                result |= 0x1
            self.clk.off()
        
        self.cs.on()    # end 

        return result

    def voltage(self):
        adc_value = self.read_adc(0)
        voltage = (adc_value / 255.0) * 5 # converting adc to voltage
        return voltage