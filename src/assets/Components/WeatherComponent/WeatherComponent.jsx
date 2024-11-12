import axios from 'axios';
import React, { useMemo, useEffect, useState } from 'react';
import './WeatherComponent.css';

const WeatherComponent = () => {
    const [weatherData, setWeatherData] = useState(null);
    const [location, setLocation] = useState('');
    const [searchCity, setSearchCity] = useState('');
    const [citySuggestions, setCitySuggestions] = useState([]);
    const [backgroundVideo, setBackgroundVideo] = useState('/sunny.mp4');

    const API_KEY = '097173df330e44c1b5544401242110';

    const updateBackgroundVideo = (condition) => {
        const isSunny = condition.toLowerCase().includes('sunny') || 
                       condition.toLowerCase().includes('clear');
        if (isSunny)
        {
            setBackgroundVideo('./sunny.mp4');
        }
        else if(condition.toLowerCase().includes('overcast')||condition.toLowerCase().includes('partly cloudy'))
        {
            setBackgroundVideo('./overcast.mp4');
        }
        else if(condition.toLowerCase().includes('light snow')||condition.toLowerCase().includes('moderate Snow')||condition.toLowerCase().includes('heavy snow')||condition.toLowerCase().includes('snow showers'))
        {
            setBackgroundVideo('https://videos.pexels.com/video-files/854881/854881-hd_1920_1080_25fps.mp4');
        }
        else if(condition.toLowerCase().includes('fog')||condition.toLowerCase().includes('freezing fog')||condition.toLowerCase().includes('mist'))
        {
            setBackgroundVideo('https://videos.pexels.com/video-files/3615892/3615892-uhd_2560_1440_25fps.mp4');
        }
        else
        {
            setBackgroundVideo('./rainy.mp4');
        }
        // setBackgroundVideo(isSunny ? '/sunny.mp4' : '/rainy.mp4');
    };

    const fetchWeatherData = useMemo(() => async (city) => {
        try {
            const { data } = await axios.get(`https://api.weatherapi.com/v1/current.json`, {
                params: {
                    key: API_KEY,
                    q: city || location
                },
            });
            setWeatherData(data);
            console.log(data.current.condition);
            updateBackgroundVideo(data.current.condition.text);
            setCitySuggestions([]);
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    }, [location]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const loc = `${position.coords.latitude},${position.coords.longitude}`;
                setLocation(loc);
                fetchWeatherData(loc);
            },
            (error) => {
                console.error('Error getting location:', error);
            }
        );
    }, [fetchWeatherData]);

    useEffect(() => {
        if (searchCity.trim() === '') {
            fetchWeatherData(location);
            setCitySuggestions([]);
        }
    }, [searchCity]);

    const fetchCitySuggestions = async (query) => {
        if (query.length > 2) {
            const { data } = await axios.get(`https://api.weatherapi.com/v1/search.json`, {
                params: {
                    key: API_KEY,
                    q: query || location,
                },
            });
            setCitySuggestions(data);
        } else {
            setCitySuggestions([]);
        }
    };

    const handleInputChange = (event) => {
        const value = event.target.value;
        setSearchCity(value);
        fetchCitySuggestions(value);
    };

    const handleCitySelect = (city) => {
        setSearchCity(city.name);
        fetchWeatherData(city.name);
    };

    return (
        <div id="pageContainer">
            <div id="videoContainer">
                <video
                    key={backgroundVideo}
                    autoPlay
                    muted
                    loop
                    id="videoStyle"
                >
                    <source src={backgroundVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
            <div id='contentContainer'>
                <h1>Weather App</h1>
                <div id="outerContainer">
                    <div id="searchContainer">
                        <input
                            type="text"
                            id="inputStyle"
                            placeholder="Search for a city"
                            value={searchCity}
                            onChange={handleInputChange}
                        />

                        {citySuggestions.length > 0 && (
                            <div id="suggestionsContainer">
                                {citySuggestions.map((city, index) => (
                                    <div
                                        key={index}
                                        id="suggestionItem"
                                        onClick={() => handleCitySelect(city)}
                                    >
                                        {city.name}, {city.region}, {city.country}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div id="weatherContainer">
                        <p>Current Location: {weatherData && weatherData.location.name}, {weatherData && weatherData.location.region}</p>
                        {weatherData && (
                            <div>
                                <p>Temperature: {weatherData.current.temp_c} °C</p>
                                <p>Humidity: {weatherData.current.humidity} %</p>
                                <p>Condition: {weatherData.current.condition.text}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeatherComponent;
