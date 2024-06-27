from config_module import Configuration
import os
import requests

class API:
    def __init__(self):
        project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        config_file_path = os.path.join(project_dir, 'config.ini')
        self.config = Configuration(config_file_path)
        self.endpoint = self.config.get_api_endpoint()
    
    def send_data(self, temperature, humidity, smoke, co2, benzene, nh3, co, nh4):
        data = {'temperature': f'{temperature.strip()}',
                'humidity': f'{humidity.strip()}',
                'smoke': f'{smoke.strip()}', 
                'co2': f'{co2.strip()}', 
                'benzene': f'{benzene.strip()}',
                'nh3': f'{nh3.strip()}',
                'co': f'{co.strip()}',
                'nh4': f'{nh4.strip()}'
                }
        response = requests.post(self.endpoint['endpoint_API'], json=data)
        return response.status_code
    