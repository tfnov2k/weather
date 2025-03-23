import { Component, OnInit, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { JsonPipe, NgIf, isPlatformBrowser } from '@angular/common';
import { ApiService } from './api.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { parseStringPromise } from 'xml2js';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule, NgIf, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  data: any;
  title = 'weather';
  countryName: string = '';
  locationName: string = '';
  currentWeather: string = '';
  sunriseTime: string = '';
  sunsetTime: string = '';
  weatherData: any;
  locationInput: string = 'London';

  constructor(
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {console.log('AppComponent constructor called');}

  getWeatherIcon(): string {
    if (!this.currentWeather) {
      return "../assets/sky.png";
    }
    
    const weather = this.currentWeather.toLowerCase();
    
    if (weather.includes('sun') || weather.includes('clear')) {
      return "../assets/sun.png";
    } else if (weather.includes('cloud')) {
      return "../assets/cloud.png";
    } else if (weather.includes('rain')) {
      return "../assets/rain.png";
    } else if (weather.includes('snow')) {
      return "../assets/snow.png";
    } else {
      return "../assets/sky.png"; 
    }
  }

  ngOnInit(): void {
    console.log('ngOnInit started, platform is browser:', isPlatformBrowser(this.platformId));
    this.fetchWeatherData(this.locationInput);
  }

  fetchWeatherData(location: string): void {
    // Make the API call
    this.apiService.getData(location).subscribe({
      next: (response) => {
        console.log('API response received:', response ? 'data exists' : 'no data');
        
        if (typeof response === 'string') {
          console.log('Response preview:', response.substring(0, 100));
        } else {
          console.log('Response type:', typeof response);
        }
        
        this.data = response;
        
        // Parse XML differently depending on platform
        if (isPlatformBrowser(this.platformId)) {
          console.log('Parsing in browser');
          try {
            // Browser-side parsing
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(response, "text/xml");
            console.log('XML parsed successfully');
            
            // Get the country value and store it
            const countryElement = xmlDoc.querySelector("location > country");
            if (countryElement && countryElement.textContent) {
              this.countryName = countryElement.textContent;
              console.log('Country:', this.countryName);
            }

            // Get the location value and store it
            const locationElement = xmlDoc.querySelector("location > name");
            if (locationElement && locationElement.textContent) {
              this.locationName = locationElement.textContent;
              console.log('Location:', this.locationName);
            }

            // Get the sunrise value and store it
            const sunElement = xmlDoc.querySelector("sun");
            if (sunElement) {
              const riseDateTime = sunElement.getAttribute("rise");
              if (riseDateTime) {
                // Extract just the time portion (after T)
                this.sunriseTime = riseDateTime.split("T")[1];
                console.log('Sunrise time:', this.sunriseTime);
              } else {
                console.log('Sunrise time attribute not found');
              }

              // Get the sunrise value and store it
              const setDateTime = sunElement.getAttribute("set");
              if (setDateTime) {
                // Extract just the time portion (after T)
                this.sunsetTime = setDateTime.split("T")[1];
                console.log('Sunset time:', this.sunsetTime);
              } else {
                console.log('Sunset time attribute not found');
              }
            } else {
              console.log('Sun element not found');
            }

            // Get current time and find matching forecast
            const currentTime = new Date();
            console.log('Current time:', currentTime);
            
            // Get all time elements
            const timeElements = xmlDoc.querySelectorAll("time");
            
            // Find the matching time period
            for (let i = 0; i < timeElements.length; i++) {
              const timeElement = timeElements[i];
              const fromStr = timeElement.getAttribute("from");
              const toStr = timeElement.getAttribute("to");
              
              if (fromStr && toStr) {
                const fromTime = new Date(fromStr);
                const toTime = new Date(toStr);
                
                if (currentTime >= fromTime && currentTime < toTime) {
                  // Found the right time period
                  const symbolElement = timeElement.querySelector("symbol");
                  if (symbolElement) {
                    this.currentWeather = symbolElement.getAttribute("name") || "";
                    console.log('Current weather:', this.currentWeather);
                  }
                  break;
                }
              }
            }
          } catch (err) {
            console.error('Error parsing XML in browser:', err);
          }
        } else {
          console.log('Parsing on server');
          // Server-side parsing (Not used on browser, just to log in console)
          parseStringPromise(response).then(result => {
            this.countryName = result.weatherdata.location[0].country[0];
            console.log('Country:', this.countryName);
            this.locationName = result.weatherdata.location[0].name[0];
            console.log('Location:', this.locationName);
          }).catch(err => console.error('Error parsing XML on server:', err));
        }
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      },
      complete: () => {
        console.log('API call completed');
      }
    });
  }

  ngAfterViewInit(): void {
    // Only access document when in browser environment
    if (isPlatformBrowser(this.platformId)) {
      const textarea = document.getElementById('textbox') as HTMLTextAreaElement;
      if (textarea) {
        textarea.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (textarea.value.trim()) {
              this.locationInput = textarea.value.trim();
              this.fetchWeatherData(this.locationInput);
            }
            textarea.blur();
          }
        });
        
        textarea.addEventListener('blur', () => {
          if (textarea.value.trim() && textarea.value.trim() !== this.locationInput) {
            this.locationInput = textarea.value.trim();
            this.fetchWeatherData(this.locationInput);
          }
        });
      }
    }
  }
}