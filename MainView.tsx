import React, { useEffect, useState, createContext, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { LineChart } from 'react-native-chart-kit';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/FontAwesome';
import PushNotification from 'react-native-push-notification';


// Context for managing application state
const AppContext = createContext();

const AppProvider = ({ children }) => {
    const [details, setDetails] = useState({ temperature: 0, humidity: 0, airQuality: 0 });
    const [history, setHistory] = useState({ temperature: [], humidity: [], airQuality: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("https://airQwebapp.azurewebsites.net/api/airquality/airquality", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                const temperature = data.temperature;
                const humidity = data.humidity;
                const airQuality = data.airQ;

                setDetails({ temperature, humidity, airQuality });

                setHistory(prevHistory => ({
                    temperature: [...prevHistory.temperature, temperature].slice(-10),
                    humidity: [...prevHistory.humidity, humidity].slice(-10),
                    airQuality: [...prevHistory.airQuality, airQuality].slice(-10),
                }));

                if (airQuality > 100) {
                    showNotification("Calitatea aerului este bad.", "Vă rugăm să luați măsuri de precauție.");
                } else if (airQuality > 50) {
                    showNotification("Calitatea aerului este moderate.", "Calitatea aerului este moderată.");
                }
            } else {
                throw new Error('Network response was not ok.');
            }
        } catch (error) {
            setError('Error fetching data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (title, message) => {
        PushNotification.localNotification({
            title: title,
            message: message,
            playSound: true,
            soundName: 'default',
            importance: 'high',
            vibrate: true,
        });
    };

    useEffect(() => {
        fetchData();
        const time_interval = setInterval(fetchData, 5000);
        return () => clearInterval(time_interval);
    }, []);

    return (
        <AppContext.Provider value={{ details, history, loading, error, fetchData }}>
            {children}
        </AppContext.Provider>
    );
};

const useAppContext = () => {
    return useContext(AppContext);
};

const HomeScreen = ({ navigation }) => {
    const [menuVisible, setMenuVisible] = useState(false);

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Icon name="thermometer" size={40} color="#086D41" style={styles.logoIcon} />
                <Icon name="tint" size={40} color="#086D41" style={styles.logoIcon} />
                <Icon name="cloud" size={40} color="#086D41" style={styles.logoIcon} />
            </View>
            <Text style={styles.heading}>Sistem de Monitorizare a Calitatii Aerului</Text>
            <TouchableOpacity
                style={styles.homeButton}
                onPress={() => setMenuVisible(!menuVisible)}
            >
                <Text style={styles.buttonText}>Start</Text>
                {menuVisible && (
                    <View style={styles.menu}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => { setMenuVisible(false); navigation.navigate('Temperature'); }}
                        >
                            <Text style={styles.menuItemText}>Temperatura</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => { setMenuVisible(false); navigation.navigate('Humidity'); }}
                        >
                            <Text style={styles.menuItemText}>Umiditate</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => { setMenuVisible(false); navigation.navigate('AirQuality'); }}
                        >
                            <Text style={styles.menuItemText}>Calitatea Aerului</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
};

const GaugeChart = ({ value, unit, color }) => {
    const size = 150;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (1 - value / 100) * circumference;

    return (
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#e6e6e6"
                strokeWidth={strokeWidth}
                fill="none"
            />
            <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={progress}
                strokeLinecap="round"
                rotation="-90"
                origin={`${size / 2}, ${size / 2}`}
            />
            <SvgText
                x={size / 2}
                y={size / 2 - 10}
                textAnchor="middle"
                fontSize="24"
                fill={color}
            >
                {value}
            </SvgText>
            <SvgText
                x={size / 2}
                y={size / 2 + 20}
                textAnchor="middle"
                fontSize="16"
                fill="#333"
            >
                {unit}
            </SvgText>
        </Svg>
    );
};

const TemperatureScreen = () => {
    const { details, history, loading, error } = useAppContext();

    return (
        <View style={styles.screenContainer}>
            <Text style={styles.screenHeading}>Temperatura</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#086D41" />
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : (
                <>
                    <GaugeChart value={details.temperature} unit="°C" color="#FFE552" />
                    <LineChart
                        data={{
                            labels: history.temperature.map((_, index) => (index + 1).toString()),
                            datasets: [
                                {
                                    data: history.temperature,
                                }
                            ]
                        }}
                        width={Dimensions.get('window').width - 40}
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix="°C"
                        chartConfig={{
                            backgroundColor: "#F4FBF8",
                            backgroundGradientFrom: "#F4FBF8",
                            backgroundGradientTo: "#F4FBF8",
                            decimalPlaces: 2,
                            color: (opacity = 1) => `rgba(8, 109, 65, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(8, 109, 65, ${opacity})`,
                            style: {
                                borderRadius: 16
                            },
                            propsForDots: {
                                r: "6",
                                strokeWidth: "2",
                                stroke: "#086D41"
                            }
                        }}
                        style={{
                            marginVertical: 8,
                            borderRadius: 16
                        }}
                    />
                </>
            )}
        </View>
    );
};

const HumidityScreen = () => {
    const { details, history, loading, error } = useAppContext();

    return (
        <View style={styles.screenContainer}>
            <Text style={styles.screenHeading}>Umiditate</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#086D41" />
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : (
                <>
                    <GaugeChart value={details.humidity} unit="%" color="#3D99D6" />
                    <LineChart
                        data={{
                            labels: history.humidity.map((_, index) => (index + 1).toString()),
                            datasets: [
                                {
                                    data: history.humidity,
                                }
                            ]
                        }}
                        width={Dimensions.get('window').width - 40}
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix="%"
                        chartConfig={{
                            backgroundColor: "#F4FBF8",
                            backgroundGradientFrom: "#F4FBF8",
                            backgroundGradientTo: "#F4FBF8",
                            decimalPlaces: 2,
                            color: (opacity = 1) => `rgba(8, 109, 65, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(8, 109, 65, ${opacity})`,
                            style: {
                                borderRadius: 16
                            },
                            propsForDots: {
                                r: "6",
                                strokeWidth: "2",
                                stroke: "#086D41"
                            }
                        }}
                        style={{
                            marginVertical: 8,
                            borderRadius: 16
                        }}
                    />
                </>
            )}
        </View>
    );
};

const AirQualityScreen = () => {
    const { details, loading, error } = useAppContext();

    return (
        <View style={styles.screenContainer}>
            <Text style={styles.screenHeading}>Calitatea Aerului</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#086D41" />
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : (
                <GaugeChart value={details.airQuality} unit="AQI" color="#87AE61" />
            )}
        </View>
    );
};

const SettingsScreen = () => {
    return (
        <View style={styles.screenContainer}>
            <Text style={styles.screenHeading}>Setări</Text>
            {/* Conținutul paginii de setări */}
        </View>
    );
};

const Stack = createStackNavigator();

const MainView = () => {
    return (
        <AppProvider>
            <Stack.Navigator initialRouteName="Home">
                <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Temperature" component={TemperatureScreen} options={{ title: 'Temperatura' }} />
                <Stack.Screen name="Humidity" component={HumidityScreen} options={{ title: 'Umiditate' }} />
                <Stack.Screen name="AirQuality" component={AirQualityScreen} options={{ title: 'Calitatea Aerului' }} />
                <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Setări' }} />
            </Stack.Navigator>
        </AppProvider>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F4FBF8',
    },
    heading: {
        fontSize: 32,
        marginBottom: 16,
        fontWeight: 'bold',
        color: '#086D41',
        textAlign: 'center',
    },
    logoContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    logoIcon: {
        marginHorizontal: 10,
    },
    homeButton: {
        alignItems: 'center',
        backgroundColor: '#086D41',
        padding: 20,
        borderRadius: 8,
        width: '60%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    buttonText: {
        fontSize: 20,
        color: '#F4FBF8',
    },
    menu: {
        position: 'absolute',
        top: 70,
        width: '100%',
        backgroundColor: '#086D41',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
        zIndex: 10,
    },
    menuItem: {
        padding: 15,
        alignItems: 'center',
    },
    menuItemText: {
        fontSize: 18,
        color: '#F4FBF8',
    },
    screenContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F4FBF8',
    },
    screenHeading: {
        fontSize: 32,
        marginBottom: 16,
        fontWeight: 'bold',
        color: '#086D41',
        textAlign: 'center',
    },
    errorText: {
        fontSize: 18,
        color: 'red',
        marginBottom: 10,
    },
    value: {
        fontSize: 48,
        marginLeft: 10,
    },
});

export default MainView;
