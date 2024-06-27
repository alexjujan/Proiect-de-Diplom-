import configparser
import ast

class Configuration:
    def __init__(self, config_file):
        self.config_file = config_file
        self.config = configparser.ConfigParser()
        self.config.read(config_file)

    def get_htu21_config(self):
        htu21 = {}
        htu21['SDA'] = self.config.getint('HTU21','SDA')
        htu21['SCL'] = self.config.getint('HTU21', 'SCL')
        hexstring = self.config.get('HTU21', 'TRIGGER_TEMP')
        htu21['TRIGGER_TEMP'] = int(hexstring, 16)
        hexstring = self.config.get('HTU21', 'TRIGGER_HUM')
        htu21['TRIGGER_HUM'] = int(hexstring, 16)
        hexstring = self.config.get('HTU21', 'SOFT_RESET')
        htu21['SOFT_RESET'] = int(hexstring, 16)
        hexstring = self.config.get('HTU21', 'I2C_ADDR')
        htu21['I2C_ADDR'] = int(hexstring, 16)
        return htu21
    
    def get_adc_config(self):
        adc_converter = {}
        adc_converter['CS_PIN'] = self.config.getint('ADC', 'CS_PIN')
        adc_converter['CLK_PIN'] = self.config.getint('ADC', 'CLK_PIN')
        adc_converter['DI_PIN'] = self.config.getint('ADC', 'DI_PIN')
        adc_converter['DO_PIN'] = self.config.getint('ADC', 'DO_PIN')
        return adc_converter

    def get_api_endpoint(self):
        endpoint = {}
        endpoint['endpoint_API'] = self.config.get('API', 'endpoint_API')
        return endpoint
        
        